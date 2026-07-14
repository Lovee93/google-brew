import React from 'react';

export default function CustomerProfile({ customer, loading }) {
  if (loading) {
    return (
      <section className="brew-card">
        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="skeleton skeleton-avatar" />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-title" style={{ width: '40%', height: '20px' }} />
              <div className="skeleton skeleton-text" style={{ width: '25%', height: '14px' }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: '140px', width: '100%', borderRadius: '16px' }} />
        </div>
      </section>
    );
  }

  if (!customer) return null;

  // Deriving progress values from customer points
  const points = customer.points || 0;
  const cyclePoints = points % 50;
  const pointsNeeded = 50 - cyclePoints;
  const progressPercent = (cyclePoints / 50) * 100;
  
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const redemptionsTodayCount = customer.summary?.redemptions_today || 0;

  return (
    <section className="brew-card">
      {/* Profile details */}
      <div className="profile-section">
        <div className="profile-avatar">
          {customer.name?.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="profile-info">
          <h3>{customer.name}</h3>
          <p>{customer.email}</p>
          <span className={`tier-badge ${customer.tier?.toLowerCase()}`}>
            {customer.tier} Tier
          </span>
        </div>
      </div>

      {/* Progress and Gauge */}
      <div className="progress-container">
        <div className="points-gauge">
          <svg className="points-gauge-svg">
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary-gold)" />
                <stop offset="100%" stopColor="#ffb300" />
              </linearGradient>
            </defs>
            <circle 
              className="points-gauge-bg"
              cx="70" 
              cy="70" 
              r={radius} 
            />
            <circle 
              className="points-gauge-fill"
              cx="70" 
              cy="70" 
              r={radius} 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="points-gauge-text">
            <span className="points-number">{points}</span>
            <span className="points-label">Points</span>
          </div>
        </div>

        <div className="points-summary-text">
          <h4>Brew Progress ({cyclePoints}/50 pts)</h4>
          <p style={{ marginBottom: '8px' }}>
            You need <strong>{pointsNeeded} more point{pointsNeeded !== 1 ? 's' : ''}</strong> to unlock your next Free Coffee Reward.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Each 50 points accumulated automatically mints a Free Coffee Reward coupon.
          </p>
        </div>
      </div>

      {/* Anti-Fraud Limits dots */}
      <div className="limit-alert-card">
        <div className="limit-alert-header">
          <span className="limit-alert-title">Daily Redemption Limit</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: redemptionsTodayCount >= 3 ? 'var(--error)' : 'var(--success)' }}>
            {redemptionsTodayCount} / 3 Redeemed Today
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="limit-dots">
            {[1, 2, 3].map((dotIndex) => {
              const isActive = redemptionsTodayCount >= dotIndex;
              let dotClass = "limit-dot";
              if (isActive) {
                if (redemptionsTodayCount === 1) dotClass += " active";
                else if (redemptionsTodayCount === 2) dotClass += " warning";
                else dotClass += " danger";
              }
              return (
                <div 
                  key={dotIndex} 
                  className={dotClass} 
                  title={isActive ? `Redemption ${dotIndex} processed` : `Redemption slot ${dotIndex} available`}
                />
              );
            })}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '75%', textAlign: 'right' }}>
            To guard against promotional abuse, a maximum of 3 reward redemptions is allowed per customer daily.
          </p>
        </div>
      </div>
    </section>
  );
}
