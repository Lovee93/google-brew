import React from 'react';

export default function CashierSimulator({
  loading,
  purchaseLoading,
  purchaseAmount,
  onPurchaseAmountChange,
  onPurchaseSubmit,
  customer,
  activeRewardsCount
}) {
  return (
    <section className="brew-card">
      <div className="brew-card-header">
        <div>
          <h2 className="brew-card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary-gold)' }}>
              <rect width="20" height="12" x="2" y="6" rx="2" />
              <path d="M12 12h.01M17 12h.01M7 12h.01M16 18H8" />
            </svg>
            Cashier Simulator
          </h2>
          <p className="brew-card-subtitle">Simulate customer orders to reward coffee points ($1 = 1 point)</p>
        </div>
      </div>

      <form onSubmit={onPurchaseSubmit} className="simulator-form">
        <div className="form-group">
          <label className="form-label" htmlFor="amount-input">Order Transaction Total</label>
          <div className="input-with-icon">
            <span className="input-icon">$</span>
            <input 
              id="amount-input"
              className="brew-input"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={purchaseAmount}
              onChange={(e) => onPurchaseAmountChange(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="quick-amounts">
          {[4.50, 9.20, 15.00, 50.00, 105.50].map((amt) => (
            <button
              key={amt}
              type="button"
              className="quick-amount-btn"
              onClick={() => onPurchaseAmountChange(amt.toFixed(2))}
              disabled={loading}
            >
              ${amt.toFixed(2)}
            </button>
          ))}
        </div>

        <button 
          type="submit" 
          className="brew-btn" 
          disabled={loading || purchaseLoading || !purchaseAmount}
        >
          {purchaseLoading ? (
            <div className="spinner" />
          ) : (
            <>
              <span>Record Purchase</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Quick summary stats */}
      {!loading && customer && (
        <div className="stats-strip">
          <div className="stat-item">
            <div className="stat-number">{customer.points}</div>
            <div className="stat-label">Total Points</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{customer.summary?.rewards_redeemed_all_time}</div>
            <div className="stat-label">Redeemed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{activeRewardsCount}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
      )}
    </section>
  );
}
