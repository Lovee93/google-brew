import express from 'express';
import { store } from './store.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// CORS simple middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 1. Customer Rewards Dashboard
app.get('/v1/customers/:customerId/dashboard', (req, res) => {
  const { customerId } = req.params;
  const customer = store.getCustomer(customerId);

  if (!customer) {
    return res.status(404).json({ error: 'CUSTOMER_NOT_FOUND', message: 'Customer not found.' });
  }

  const rewards = store.getCustomerRewards(customerId);
  const unlockedRewardsAvailable = rewards.filter(r => r.status === 'unlocked').length;
  const redeemedRewards = rewards.filter(r => r.status === 'redeemed');

  const currentPointsInCycle = customer.points % 50;
  const pointsNeeded = 50 - currentPointsInCycle;
  const redemptionsToday = store.getRedemptionsCountToday(customerId);

  res.status(200).json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      points: customer.points,
      tier: customer.tier,
      progress_to_next_reward: {
        current_points_in_cycle: currentPointsInCycle,
        points_needed: pointsNeeded,
        unlocked_rewards_available: unlockedRewardsAvailable
      }
    },
    dashboard_summary: {
      points_earned_all_time: customer.points, // in-memory store simplifies this to current total points
      rewards_redeemed_all_time: redeemedRewards.length,
      redemptions_today: redemptionsToday
    }
  });
});

// 2. Add Purchase (Earn Points)
app.post('/v1/purchases', (req, res) => {
  const { customerId, amount } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'customerId is required.' });
  }
  if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'amount must be a positive number.' });
  }

  const purchase = store.addPurchase(customerId, amount);
  if (!purchase) {
    return res.status(404).json({ error: 'CUSTOMER_NOT_FOUND', message: 'Customer not found.' });
  }

  res.status(201).json(purchase);
});

// 3. List Customer Rewards
app.get('/v1/customers/:customerId/rewards', (req, res) => {
  const { customerId } = req.params;
  const customer = store.getCustomer(customerId);

  if (!customer) {
    return res.status(404).json({ error: 'CUSTOMER_NOT_FOUND', message: 'Customer not found.' });
  }

  const rewards = store.getCustomerRewards(customerId);
  res.status(200).json({ rewards });
});

// 4. Redeem Reward (with anti-fraud limit of max 3 daily redemptions)
app.post('/v1/customers/:customerId/redemptions', (req, res) => {
  const { customerId } = req.params;
  const { rewardId } = req.body;

  if (!rewardId) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'rewardId is required in request body.' });
  }

  const result = store.redeemReward(customerId, rewardId);

  if (!result.success) {
    return res.status(result.status).json({
      error: result.error,
      message: result.message
    });
  }

  res.status(201).json(result.data);
});

// Fallback all other GET requests to index.html for React router
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/v1') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Google Brew server running at http://localhost:${port}`);
});
