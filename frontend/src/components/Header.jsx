import React from 'react';

export default function Header({ isOnline, checkingHealth, onRefreshHealth }) {
  return (
    <header className="app-header">
      <div className="logo-container">
        <div className="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#1a0f05' }}>
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <path d="M6 2v2M10 2v2M14 2v2" />
          </svg>
        </div>
        <h1 className="logo-text">Google<span>Brew</span></h1>
      </div>
      
      <div className="server-status">
        <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
        <span>{isOnline ? 'Connected' : 'Demo Mode'}</span>
        <button 
          onClick={onRefreshHealth} 
          disabled={checkingHealth}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '8px'
          }}
          title="Refresh connection status"
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className={checkingHealth ? 'spinner' : ''}
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
        </button>
      </div>
    </header>
  );
}
