import React from 'react';

export default function AntiFraudModal({
  dialogRef,
  modalMessage,
  onCloseModal,
  onDialogClick
}) {
  return (
    <dialog 
      ref={dialogRef}
      className="anti-fraud-modal"
      onClick={onDialogClick}
      aria-labelledby="anti-fraud-title"
    >
      <div className="modal-content">
        <div className="modal-icon-red">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 9v4M12 17h.01M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
          </svg>
        </div>
        <h3 id="anti-fraud-title" className="modal-title">Promotion Blocked</h3>
        <p className="modal-desc">
          {modalMessage}
        </p>
        <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <strong>Server Anti-Abuse Rule:</strong> Jane Doe has triggered the automatic velocity filter. Redemptions are temporarily frozen until the next calendar day.
        </div>
        <div className="modal-footer">
          <button className="modal-btn" onClick={onCloseModal}>Acknowledge</button>
        </div>
      </div>
    </dialog>
  );
}
