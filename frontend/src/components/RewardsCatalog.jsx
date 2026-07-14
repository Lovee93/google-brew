import React from 'react';

export default function RewardsCatalog({
  loading,
  activeTab,
  onTabChange,
  activeRewards,
  redeemedRewards,
  onRedeemReward
}) {
  return (
    <section className="brew-card" style={{ marginBottom: '40px' }}>
      <div className="rewards-tabs-container">
        <button 
          className={`rewards-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => onTabChange('active')}
        >
          Available Rewards ({activeRewards.length})
        </button>
        <button 
          className={`rewards-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onTabChange('history')}
        >
          Redeemed History ({redeemedRewards.length})
        </button>
      </div>

      {loading ? (
        <div className="rewards-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="reward-card" style={{ height: '150px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-title" style={{ width: '60%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                </div>
              </div>
              <div className="skeleton" style={{ height: '36px', width: '100%' }} />
            </div>
          ))}
        </div>
      ) : activeTab === 'active' ? (
        activeRewards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎟️</div>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>No rewards unlocked yet</p>
            <p style={{ fontSize: '13px' }}>Simulate cashier purchases above to build points and unlock free coffees!</p>
          </div>
        ) : (
          <div className="rewards-grid">
            {activeRewards.map((reward) => (
              <div key={reward.rewardId} className="reward-card pulse">
                <div className="reward-card-info">
                  <div className="reward-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="reward-card-text">
                    <h4>{reward.name}</h4>
                    <p>Worth: 1 Free Specialty Drink</p>
                    <p style={{ fontSize: '11px', marginTop: '4px' }}>Unlocked: {new Date(reward.unlocked_at).toLocaleString()}</p>
                  </div>
                </div>
                
                <button 
                  className="reward-action-btn"
                  onClick={() => onRedeemReward(reward.rewardId)}
                >
                  <span>Redeem Reward</span>
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        redeemedRewards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📜</div>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>No redemptions found</p>
            <p style={{ fontSize: '13px' }}>Once you redeem available coupons, your historical rewards will show up here.</p>
          </div>
        ) : (
          <div className="rewards-grid">
            {redeemedRewards.map((reward) => (
              <div key={reward.rewardId} className="reward-card redeemed">
                <div className="reward-card-info">
                  <div className="reward-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <div className="reward-card-text">
                    <h4>{reward.name}</h4>
                    <p>Points Redeemed: {reward.points_spent} pts</p>
                    <p style={{ fontSize: '11px', marginTop: '4px' }}>Redeemed: {new Date(reward.redeemed_at).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="redeemed-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Redeemed</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  );
}
