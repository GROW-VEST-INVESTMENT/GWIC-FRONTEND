import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import GlobalNotificationCenter from './components/GlobalNotificationCenter';
import LandingPage from './pages/LandingPage/LandingPage';
import AccountAccess from './pages/AccountAccess/AccountAccess';
import Dashboard from './pages/Dashboard/Dashboard';
import CoreLock from './pages/CoreLock/CoreLock';
import Activity from './pages/Activity/Activity';
import CreateGoal from './pages/CreateGoal/CreateGoal';
import SavingsGoals from './pages/SavingsGoals/SavingsGoals';
import More from './pages/More/More';
import Notifications from './pages/Notifications/Notifications';
import Portfolio from './pages/Portfolio/Portfolio';
import PortfolioAllocation from './pages/Portfolio/PortfolioAllocation';
import Invest from './pages/Invest/Invest';
import InvestStockDetails from './pages/Invest/InvestStockDetails';
import {
  notifyUser,
  playNotificationSound,
  requestBrowserNotificationPermission,
  setNotificationSoundEnabled,
} from './utils/notifications';

function NotificationPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const dismissed = window.localStorage.getItem('gwic-notification-permission-dismissed');
    const supported = 'Notification' in window;
    const permission = supported ? Notification.permission : 'unsupported';

    if (!supported || permission !== 'default' || dismissed === 'true') {
      return undefined;
    }

    const triggerPermissionPrompt = () => {
      setVisible(true);
      window.removeEventListener('pointerdown', triggerPermissionPrompt);
      window.removeEventListener('keydown', triggerPermissionPrompt);
    };

    window.addEventListener('pointerdown', triggerPermissionPrompt, { once: true });
    window.addEventListener('keydown', triggerPermissionPrompt, { once: true });

    return () => {
      window.removeEventListener('pointerdown', triggerPermissionPrompt);
      window.removeEventListener('keydown', triggerPermissionPrompt);
    };
  }, []);

  async function handleAllow() {
    setStatus('loading');
    const result = await requestBrowserNotificationPermission();
    setStatus(result === 'granted' ? 'granted' : 'denied');
    setNotificationSoundEnabled(true);
    if (result === 'granted') {
      playNotificationSound();
      notifyUser({
        title: 'Notifications enabled',
        message: 'You will now receive GWIC alerts and deposit updates in this browser.',
        type: 'success',
      });
    }
    setVisible(false);
  }

  function handleDismiss() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('gwic-notification-permission-dismissed', 'true');
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="gwic-permission-prompt" role="dialog" aria-live="polite" aria-label="Enable browser notifications">
      <div className="gwic-permission-card">
        <strong>Enable browser notifications</strong>
        <p>Allow GWIC to show alerts, payment updates, and important account activity in your browser.</p>
        <div className="gwic-permission-actions">
          <button type="button" className="gwic-permission-button primary" onClick={handleAllow} disabled={status === 'loading'}>
            {status === 'loading' ? 'Enabling…' : 'Allow notifications'}
          </button>
          <button type="button" className="gwic-permission-button secondary" onClick={handleDismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

function GlobalRouteLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 280);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className={`gwic-route-loader ${visible ? 'show' : ''}`} aria-live="polite" aria-label="Loading page">
      <div className="gwic-route-spinner" />
    </div>
  );
}

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.gwicNotify = notifyUser;
      if (!window.localStorage.getItem('gwic-notification-sound')) {
        setNotificationSoundEnabled(true);
      }
    }

    return () => {
      if (typeof window !== 'undefined' && window.gwicNotify === notifyUser) {
        delete window.gwicNotify;
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <GlobalRouteLoader />
      <GlobalNotificationCenter />
      <NotificationPermissionPrompt />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/get-started" element={<AccountAccess />} />
        <Route path="/login" element={<AccountAccess />} />
        <Route path="/forgot-password" element={<AccountAccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/core-lock" element={<CoreLock />} />
        <Route path="/invest/:ticker" element={<InvestStockDetails />} />
        <Route path="/invest" element={<Invest />} />
        <Route path="/create-goal" element={<CreateGoal />} />
        <Route path="/goals" element={<SavingsGoals />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/portfolio/allocation" element={<PortfolioAllocation />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/more" element={<More />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;