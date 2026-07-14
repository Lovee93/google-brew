// Client-side fallback memory store in case the backend is down.
// Intentionally mirrors the reward/tier/anti-fraud rules in backend/src/store.js
// so the UI keeps working in a demo/offline scenario — keep both in sync if the rules change.

const uuidv4 = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

class LocalMockStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.customerId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
    this.customer = {
      id: this.customerId,
      name: 'Jane Doe (Demo Mode)',
      email: 'janedoe@example.com',
      points: 215,
      tier: 'Gold'
    };

    const rewardIds = [
      'e5b15b3c-ff1a-4712-9c12-3212ab09bca3',
      'a2444b02-5e4a-4e20-8ee0-0f2c0792dbca',
      'c783c31d-2b4a-43c3-8aa7-f018d9cc9123',
      'd894d42e-3c5b-44d4-9bb8-0129e0dd0456'
    ];

    this.rewards = rewardIds.map((id, index) => {
      const isLast = index === rewardIds.length - 1;
      return {
        rewardId: id,
        customerId: this.customerId,
        name: 'Free Coffee Reward',
        status: isLast ? 'unlocked' : 'redeemed',
        points_spent: 50,
        unlocked_at: new Date(Date.now() - (4 - index) * 24 * 60 * 60 * 1000).toISOString(),
        redeemed_at: isLast ? null : new Date(Date.now() - (4 - index) * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString()
      };
    });

    this.redemptions = this.rewards
      .filter(r => r.status === 'redeemed')
      .map(r => ({
        redemptionId: uuidv4 ? uuidv4() : Math.random().toString(36).substring(2),
        customerId: this.customerId,
        rewardId: r.rewardId,
        redeemed_at: r.redeemed_at
      }));
  }

  getDashboard() {
    const rewards = this.rewards.filter(r => r.customerId === this.customer.id);
    const unlockedRewardsAvailable = rewards.filter(r => r.status === 'unlocked').length;
    const redeemedRewards = rewards.filter(r => r.status === 'redeemed');
    
    const currentPointsInCycle = this.customer.points % 50;
    const pointsNeeded = 50 - currentPointsInCycle;
    
    // Count redemptions today
    const todayStr = new Date().toISOString().split('T')[0];
    const redemptionsToday = this.redemptions.filter(r => {
      return r.customerId === this.customer.id && r.redeemed_at.startsWith(todayStr);
    }).length;

    return {
      customer: {
        id: this.customer.id,
        name: this.customer.name,
        email: this.customer.email,
        points: this.customer.points,
        tier: this.customer.tier,
        progress_to_next_reward: {
          current_points_in_cycle: currentPointsInCycle,
          points_needed: pointsNeeded,
          unlocked_rewards_available: unlockedRewardsAvailable
        }
      },
      dashboard_summary: {
        points_earned_all_time: this.customer.points,
        rewards_redeemed_all_time: redeemedRewards.length,
        redemptions_today: redemptionsToday
      }
    };
  }

  getRewards() {
    return {
      rewards: this.rewards.filter(r => r.customerId === this.customer.id)
    };
  }

  addPurchase(amount) {
    const pointsEarned = Math.floor(amount);
    const oldPoints = this.customer.points;
    const newPoints = oldPoints + pointsEarned;

    this.customer.points = newPoints;
    this.customer.tier = newPoints >= 200 ? 'Gold' : 'Standard';

    const oldRewardsCount = Math.floor(oldPoints / 50);
    const newRewardsCount = Math.floor(newPoints / 50);
    const newlyUnlockedCount = newRewardsCount - oldRewardsCount;

    for (let i = 0; i < newlyUnlockedCount; i++) {
      this.rewards.push({
        rewardId: Math.random().toString(36).substring(2, 15),
        customerId: this.customer.id,
        name: 'Free Coffee Reward',
        status: 'unlocked',
        points_spent: 50,
        unlocked_at: new Date().toISOString(),
        redeemed_at: null
      });
    }

    return {
      purchaseId: Math.random().toString(36).substring(2, 15),
      customerId: this.customer.id,
      amount,
      points_earned: pointsEarned,
      new_points_balance: newPoints,
      new_tier: this.customer.tier,
      rewards_unlocked: newlyUnlockedCount,
      created_at: new Date().toISOString()
    };
  }

  redeemReward(rewardId) {
    const reward = this.rewards.find(r => r.rewardId === rewardId && r.customerId === this.customer.id);
    if (!reward) {
      return { success: false, error: 'INVALID_REWARD', status: 400, message: 'The specified reward does not exist.' };
    }

    if (reward.status === 'redeemed') {
      return { success: false, error: 'INVALID_REWARD', status: 400, message: 'The specified reward has already been redeemed.' };
    }

    // Check limit
    const todayStr = new Date().toISOString().split('T')[0];
    const redemptionsToday = this.redemptions.filter(r => {
      return r.customerId === this.customer.id && r.redeemed_at.startsWith(todayStr);
    }).length;

    if (redemptionsToday >= 3) {
      return {
        success: false,
        error: 'DAILY_REDEMPTION_LIMIT_EXCEEDED',
        status: 429,
        message: 'Anti-fraud block: Maximum limit of 3 redemptions per day has been reached for this customer.'
      };
    }

    const redemptionId = Math.random().toString(36).substring(2, 15);
    const redeemedAt = new Date().toISOString();

    reward.status = 'redeemed';
    reward.redeemed_at = redeemedAt;

    this.redemptions.push({
      redemptionId,
      customerId: this.customer.id,
      rewardId,
      redeemed_at: redeemedAt
    });

    return {
      success: true,
      data: {
        redemptionId,
        customerId: this.customer.id,
        rewardId,
        redeemed_at: redeemedAt,
        redemptions_remaining_today: 3 - (redemptionsToday + 1)
      }
    };
  }
}

export const localMockStore = new LocalMockStore();
