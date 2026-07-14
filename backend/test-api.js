import { test } from 'node:test';
import assert from 'node:assert/strict';
import { store } from './src/store.js';

// Exercises the MemoryStore directly, covering the reward/tier calculation
// and the anti-fraud daily redemption limit. Run with: npm test

const customerId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
let unlockedRewards;
let rewardToRedeem;

test('customer starts with expected points, tier and rewards', () => {
  const customer = store.getCustomer(customerId);
  assert.strictEqual(customer.name, 'Jane Doe');
  assert.strictEqual(customer.points, 215);
  assert.strictEqual(customer.tier, 'Gold');

  const rewards = store.getCustomerRewards(customerId);
  unlockedRewards = rewards.filter(r => r.status === 'unlocked');
  assert.strictEqual(unlockedRewards.length, 1);
  assert.strictEqual(rewards.length, 4);
});

test('1st redemption of the day succeeds', () => {
  rewardToRedeem = unlockedRewards[0].rewardId;
  const res = store.redeemReward(customerId, rewardToRedeem);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.data.redemptions_remaining_today, 2);
});

test('redeeming the same reward again fails as INVALID_REWARD', () => {
  const res = store.redeemReward(customerId, rewardToRedeem);
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.error, 'INVALID_REWARD');
});

test('a $105.50 purchase earns 105 points and unlocks 2 rewards', () => {
  const purchase = store.addPurchase(customerId, 105.50);
  assert.strictEqual(purchase.points_earned, 105);
  assert.strictEqual(purchase.new_points_balance, 320);
  assert.strictEqual(purchase.new_tier, 'Gold');
  assert.strictEqual(purchase.rewards_unlocked, 2);

  const rewards = store.getCustomerRewards(customerId);
  unlockedRewards = rewards.filter(r => r.status === 'unlocked');
  assert.strictEqual(unlockedRewards.length, 2);
});

test('2nd redemption of the day succeeds', () => {
  const res = store.redeemReward(customerId, unlockedRewards[0].rewardId);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.data.redemptions_remaining_today, 1);
});

test('3rd redemption of the day succeeds', () => {
  const res = store.redeemReward(customerId, unlockedRewards[1].rewardId);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.data.redemptions_remaining_today, 0);
});

test('4th redemption of the day is blocked by the anti-fraud limit', () => {
  store.addPurchase(customerId, 50.00);
  const rewards = store.getCustomerRewards(customerId);
  const newlyUnlocked = rewards.filter(r => r.status === 'unlocked');
  assert.strictEqual(newlyUnlocked.length, 1);

  const res = store.redeemReward(customerId, newlyUnlocked[0].rewardId);
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.error, 'DAILY_REDEMPTION_LIMIT_EXCEEDED');
});
