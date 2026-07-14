import { v4 as uuidv4 } from 'uuid';

// In-memory data store
class MemoryStore {
  constructor() {
    this.customers = new Map();
    this.purchases = [];
    this.rewards = [];
    this.redemptions = [];

    // Prepopulate with a default customer from the API design spec
    const defaultCustomerId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
    this.customers.set(defaultCustomerId, {
      id: defaultCustomerId,
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      points: 215, // Unlocks Gold tier (> 200) and 4 rewards (215 / 50 = 4)
      tier: 'Gold'
    });

    const testCustomerId = 'alex-smith-test-standard';
    this.customers.set(testCustomerId, {
      id: testCustomerId,
      name: 'Alex Smith',
      email: 'alexsmith@example.com',
      points: 35,
      tier: 'Standard'
    });

    // Prepopulate the rewards for the default customer
    // 3 are already redeemed, 1 is unlocked and available
    const rewardIds = [
      'e5b15b3c-ff1a-4712-9c12-3212ab09bca3',
      'a2444b02-5e4a-4e20-8ee0-0f2c0792dbca',
      'c783c31d-2b4a-43c3-8aa7-f018d9cc9123',
      'd894d42e-3c5b-44d4-9bb8-0129e0dd0456'
    ];

    // Create 4 rewards
    rewardIds.forEach((id, index) => {
      const isLast = index === rewardIds.length - 1;
      this.rewards.push({
        rewardId: id,
        customerId: defaultCustomerId,
        name: 'Free Coffee Reward',
        status: isLast ? 'unlocked' : 'redeemed',
        points_spent: 50,
        unlocked_at: new Date(Date.now() - (4 - index) * 24 * 60 * 60 * 1000).toISOString(), // days ago
        redeemed_at: isLast ? null : new Date(Date.now() - (4 - index) * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString()
      });

      if (!isLast) {
        // Record redemptions for the redeemed ones
        this.redemptions.push({
          redemptionId: uuidv4(),
          customerId: defaultCustomerId,
          rewardId: id,
          redeemed_at: new Date(Date.now() - (4 - index) * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString()
        });
      }
    });
  }

  // Get customer by ID
  getCustomer(id) {
    return this.customers.get(id);
  }

  // Get customer rewards
  getCustomerRewards(customerId) {
    return this.rewards.filter(r => r.customerId === customerId);
  }

  // Get count of redemptions for a customer today (UTC calendar day)
  getRedemptionsCountToday(customerId) {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.redemptions.filter(r => {
      return r.customerId === customerId && r.redeemed_at.startsWith(todayStr);
    }).length;
  }

  // Add a purchase and update points/tier/rewards
  addPurchase(customerId, amount) {
    const customer = this.getCustomer(customerId);
    if (!customer) return null;

    const pointsEarned = Math.floor(amount);
    const oldPoints = customer.points;
    const newPoints = oldPoints + pointsEarned;

    // Update customer points
    customer.points = newPoints;
    customer.tier = newPoints >= 200 ? 'Gold' : 'Standard';

    // Calculate newly unlocked rewards
    const oldRewardsCount = Math.floor(oldPoints / 50);
    const newRewardsCount = Math.floor(newPoints / 50);
    const newlyUnlockedCount = newRewardsCount - oldRewardsCount;

    const unlockedRewards = [];
    for (let i = 0; i < newlyUnlockedCount; i++) {
      const reward = {
        rewardId: uuidv4(),
        customerId: customerId,
        name: 'Free Coffee Reward',
        status: 'unlocked',
        points_spent: 50,
        unlocked_at: new Date().toISOString(),
        redeemed_at: null
      };
      this.rewards.push(reward);
      unlockedRewards.push(reward);
    }

    const purchase = {
      purchaseId: uuidv4(),
      customerId,
      amount,
      points_earned: pointsEarned,
      new_points_balance: newPoints,
      new_tier: customer.tier,
      rewards_unlocked: newlyUnlockedCount,
      created_at: new Date().toISOString()
    };

    this.purchases.push(purchase);
    return purchase;
  }

  // Redeem a reward
  redeemReward(customerId, rewardId) {
    const customer = this.getCustomer(customerId);
    if (!customer) {
      return { success: false, error: 'CUSTOMER_NOT_FOUND', status: 404 };
    }

    const reward = this.rewards.find(r => r.rewardId === rewardId && r.customerId === customerId);
    if (!reward) {
      return { success: false, error: 'INVALID_REWARD', status: 400, message: 'The specified reward does not exist, or belongs to another customer.' };
    }

    if (reward.status === 'redeemed') {
      return { success: false, error: 'INVALID_REWARD', status: 400, message: 'The specified reward has already been redeemed.' };
    }

    // SERVER-SIDE ANTI-FRAUD RULE ENFORCEMENT
    // Check if the daily limit of 3 redemptions is reached
    const redemptionsToday = this.getRedemptionsCountToday(customerId);
    if (redemptionsToday >= 3) {
      return {
        success: false,
        error: 'DAILY_REDEMPTION_LIMIT_EXCEEDED',
        status: 429,
        message: 'Anti-fraud block: Maximum limit of 3 redemptions per day has been reached for this customer.'
      };
    }

    // Perform redemption
    const redemptionId = uuidv4();
    const redeemedAt = new Date().toISOString();

    reward.status = 'redeemed';
    reward.redeemed_at = redeemedAt;

    const redemption = {
      redemptionId,
      customerId,
      rewardId,
      redeemed_at: redeemedAt
    };

    this.redemptions.push(redemption);

    return {
      success: true,
      data: {
        redemptionId,
        customerId,
        rewardId,
        redeemed_at: redeemedAt,
        redemptions_remaining_today: 3 - (redemptionsToday + 1)
      }
    };
  }
}

export const store = new MemoryStore();
