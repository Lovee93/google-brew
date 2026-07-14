import React from 'react';

export default function CustomerSwitcher({ customerId, onCustomerChange }) {
  return (
    <div className="customer-switcher-container">
      <span className="customer-switcher-label">Active Customer:</span>
      <select className="customer-select" value={customerId} onChange={onCustomerChange}>
        <option value="9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d">Jane Doe (Prepopulated)</option>
        <option value="alex-smith-test-standard">Alex Smith (Standard Tier Test)</option>
      </select>
    </div>
  );
}
