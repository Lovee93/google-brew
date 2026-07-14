import { useState, useEffect, useRef } from 'react';
import * as api from './api';
import { localMockStore } from './mockStore';

// Modular Components
import Header from './components/Header';
import CustomerSwitcher from './components/CustomerSwitcher';
import CustomerProfile from './components/CustomerProfile';
import CashierSimulator from './components/CashierSimulator';
import RewardsCatalog from './components/RewardsCatalog';
import ToastContainer from './components/ToastContainer';
import AntiFraudModal from './components/AntiFraudModal';

export default function App() {
  const [customerId, setCustomerId] = useState('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d');
  const [customer, setCustomer] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Inputs & Tabs
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'

  // Toast notifications & Modals
  const [toasts, setToasts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const dialogRef = useRef(null);

  // Auto-dismiss helper for toasts
  const addToast = (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Perform backend health check
  const checkHealth = async () => {
    setCheckingHealth(true);
    const health = await api.checkBackendHealth();
    setIsOnline(health.online);
    setCheckingHealth(false);
    return health.online;
  };

  // Load data from backend or local fallback
  const loadData = async (targetId = customerId, forceOnlineCheck = false) => {
    setLoading(true);
    let online = isOnline;
    if (forceOnlineCheck) {
      online = await checkHealth();
    }

    try {
      if (online) {
        const dashboard = await api.getCustomerDashboard(targetId);
        const rewardsData = await api.getCustomerRewards(targetId);
        setCustomer({
          ...dashboard.customer,
          summary: dashboard.dashboard_summary
        });
        setRewards(rewardsData.rewards);
      } else {
        // Fallback to local mockup
        if (targetId !== '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d') {
          // Switch to secondary custom customer alex smith
          localMockStore.customer.id = targetId;
          localMockStore.customer.name = 'Alex Smith (Demo Mode)';
          localMockStore.customer.email = 'alexsmith@example.com';
          if (localMockStore.customer.points === 215) {
            localMockStore.customer.points = 35; // Start Standard customer with low points
            localMockStore.customer.tier = 'Standard';
            localMockStore.rewards = [];
            localMockStore.redemptions = [];
          }
        } else {
          // Switch back to Jane Doe
          localMockStore.customer.id = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
          localMockStore.customer.name = 'Jane Doe (Demo Mode)';
          localMockStore.customer.email = 'janedoe@example.com';
        }

        const dashboard = localMockStore.getDashboard();
        const rewardsData = localMockStore.getRewards();
        setCustomer({
          ...dashboard.customer,
          summary: dashboard.dashboard_summary
        });
        setRewards(rewardsData.rewards);
      }
    } catch (err) {
      console.error('Data loading error:', err);
      addToast('error', err.message || 'Failed to load rewards dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    loadData(customerId, true);

    // Periodically ping health
    const interval = setInterval(async () => {
      const health = await api.checkBackendHealth();
      setIsOnline(health.online);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Handle switching customers
  const handleCustomerChange = (e) => {
    const newId = e.target.value;
    setCustomerId(newId);
    loadData(newId, false);
  };

  // Simulate Purchase (Earn Points)
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(purchaseAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      addToast('error', 'Please enter a valid purchase amount greater than $0.');
      return;
    }

    setPurchaseLoading(true);
    try {
      if (isOnline) {
        const purchase = await api.addPurchase(customerId, amountNum);
        addToast('success', `Purchase of $${amountNum.toFixed(2)} recorded! Earned ${purchase.points_earned} points.`);
        if (purchase.rewards_unlocked > 0) {
          addToast('info', `Brewtastic! Unlocked ${purchase.rewards_unlocked} Free Coffee Reward(s)! ☕`);
        }
      } else {
        // Fallback simulation
        const purchase = localMockStore.addPurchase(amountNum);
        addToast('success', `[Demo Mode] Purchase of $${amountNum.toFixed(2)} recorded! Earned ${purchase.points_earned} points.`);
        if (purchase.rewards_unlocked > 0) {
          addToast('info', `[Demo Mode] Unlocked ${purchase.rewards_unlocked} Free Coffee Reward(s)! 🎉`);
        }
      }
      setPurchaseAmount('');
      // Reload dashboard
      await loadData(customerId, false);
    } catch (err) {
      addToast('error', err.message || 'Error processing purchase.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Redeem Reward
  const handleRedeemReward = async (rewardId) => {
    try {
      if (isOnline) {
        const result = await api.redeemReward(customerId, rewardId);
        if (result.success) {
          addToast('success', 'Free Coffee Reward redeemed successfully! Enjoy your brew! ☕✨');
          // Reload
          await loadData(customerId, false);
        } else {
          // If anti-fraud threshold reached
          if (result.status === 429 || result.error === 'DAILY_REDEMPTION_LIMIT_EXCEEDED') {
            triggerAntiFraudModal(result.message || 'Anti-fraud limit exceeded.');
          } else {
            addToast('error', result.message || 'Failed to redeem reward.');
          }
        }
      } else {
        // Fallback simulation
        const result = localMockStore.redeemReward(rewardId);
        if (result.success) {
          addToast('success', '[Demo Mode] Reward redeemed successfully! Enjoy your brew! ☕');
          await loadData(customerId, false);
        } else {
          if (result.status === 429 || result.error === 'DAILY_REDEMPTION_LIMIT_EXCEEDED') {
            triggerAntiFraudModal(result.message);
          } else {
            addToast('error', result.message || 'Failed to redeem reward.');
          }
        }
      }
    } catch (err) {
      addToast('error', 'Network error while attempting redemption.');
    }
  };

  // Trigger custom modal for anti-fraud message
  const triggerAntiFraudModal = (message) => {
    setModalMessage(message);
    setModalOpen(true);
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  // Fallback check to close dialog on backdrop click (for non-supporting browsers)
  const handleDialogClick = (e) => {
    if (e.target === dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeModal();
      }
    }
  };

  // Active vs redeemed rewards filtering
  const activeRewards = rewards.filter(r => r.status === 'unlocked');
  const redeemedRewards = rewards.filter(r => r.status === 'redeemed');

  return (
    <>
      {/* Header Panel */}
      <Header
        isOnline={isOnline}
        checkingHealth={checkingHealth}
        onRefreshHealth={() => loadData(customerId, true)}
      />

      {/* Switcher & Utility */}
      <CustomerSwitcher
        customerId={customerId}
        onCustomerChange={handleCustomerChange}
      />

      {/* Main Grid */}
      <main className="dashboard-grid">

        {/* Profile and Rewards Status Column */}
        <CustomerProfile
          customer={customer}
          loading={loading}
        />

        {/* Store Cashier Simulator Column */}
        <CashierSimulator
          loading={loading}
          purchaseLoading={purchaseLoading}
          purchaseAmount={purchaseAmount}
          onPurchaseAmountChange={setPurchaseAmount}
          onPurchaseSubmit={handlePurchaseSubmit}
          customer={customer}
          activeRewardsCount={activeRewards.length}
        />
      </main>

      {/* Rewards Catalog Shelf */}
      <RewardsCatalog
        loading={loading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeRewards={activeRewards}
        redeemedRewards={redeemedRewards}
        onRedeemReward={handleRedeemReward}
      />

      {/* Floating Toast Notification Stack */}
      <ToastContainer
        toasts={toasts}
        onCloseToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
      />

      {/* Anti-Fraud Limit Exceeded Dialog */}
      <AntiFraudModal
        dialogRef={dialogRef}
        modalMessage={modalMessage}
        onCloseModal={closeModal}
        onDialogClick={handleDialogClick}
      />
    </>
  );
}
