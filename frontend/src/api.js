const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin;

/**
 * Check if the backend server is reachable
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, data };
    }
  } catch (e) {
    // Fail silently, server is offline
  }
  return { online: false };
}

/**
 * Get customer rewards dashboard
 */
export async function getCustomerDashboard(customerId) {
  const res = await fetch(`${API_BASE}/v1/customers/${customerId}/dashboard`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch customer dashboard (Status: ${res.status})`);
  }
  return res.json();
}

/**
 * List customer rewards
 */
export async function getCustomerRewards(customerId) {
  const res = await fetch(`${API_BASE}/v1/customers/${customerId}/rewards`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch customer rewards (Status: ${res.status})`);
  }
  return res.json();
}

/**
 * Record a purchase to earn points
 */
export async function addPurchase(customerId, amount) {
  const res = await fetch(`${API_BASE}/v1/purchases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId, amount })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to add purchase (Status: ${res.status})`);
  }
  return res.json();
}

/**
 * Redeem an unlocked reward
 */
export async function redeemReward(customerId, rewardId) {
  const res = await fetch(`${API_BASE}/v1/customers/${customerId}/redemptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rewardId })
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: data.error || 'REDEMPTION_FAILED',
      message: data.message || `Failed to redeem reward (Status: ${res.status})`,
      status: res.status
    };
  }
  
  return {
    success: true,
    data
  };
}
