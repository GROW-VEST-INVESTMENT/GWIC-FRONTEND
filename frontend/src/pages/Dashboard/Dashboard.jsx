import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const navigation = [
  { label: 'Home', icon: 'home', target: 'dashboard-top' },
  { label: 'Core Lock', icon: 'lock', path: '/core-lock' },
  { label: 'Invest', icon: 'invest', target: 'account-balances' },
  { label: 'Portfolio', icon: 'portfolio', target: 'recent-activity' },
];

const quickActions = [
  { label: 'Deposit', icon: 'deposit', available: true, walletAction: 'deposit' },
  { label: 'Withdraw', icon: 'withdraw', available: true, walletAction: 'withdraw' },
  { label: 'Core Lock', icon: 'lock', available: true, path: '/core-lock' },
  { label: 'Invest', icon: 'invest', available: false },
];

function Icon({ name }) {
  const paths = {
    home: <><path d="m2.5 11.2 9.5-8 9.5 8h-2v9.3h-5.3v-6.1H10v6.1H4.7v-9.3h-2.2Z" fill="currentColor" stroke="none" /><path d="m2.5 11.2 9.5-8 9.5 8" strokeWidth="2.2" /></>,
    lock: <><rect x="4.5" y="10" width="15" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
    invest: <><path d="M3 20.5h18M5.5 18v-5h3v5m3 0V9h3v9m3 0V5h3v13" /><path d="m5 9 5-4 4 2 6-5m-5 0h5v5" /></>,
    portfolio: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M8 16h2l2-3 2 2 3-4m-3 0h3v3" /></>,
    more: <><path d="M3.5 6h17M3.5 12h17M3.5 18h17" strokeWidth="2.4" /></>,
    deposit: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 17v4h14v-4" /></>,
    withdraw: <><path d="M12 21V9m-5 5 5-5 5 5" /><path d="M5 7V3h14v4" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    savings: <><path d="M4 10h13a3 3 0 0 1 3 3v4H7a4 4 0 0 1-4-4v-1a2 2 0 0 1 1-2Z" /><path d="M6 10V7h8l3 3m-9 7h1m7-7v-3h3l2 3" /></>,
    car: <><path d="m4 11 2-5h12l2 5 2 2v5h-2v-2H4v2H2v-5l2-2Z" /><path d="M4 11h16M6 14h.01M18 14h.01" /></>,
    education: <><path d="m2 9 10-5 10 5-10 5L2 9Z" /><path d="M6 11v5c4 3 8 3 12 0v-5m5-2v7" /></>,
    arrowUp: <path d="M7 17 17 7M7 7h10v10" />,
  };

  return (
    <svg aria-hidden="true" className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || paths.more}
    </svg>
  );
}

function DashboardLogo({ className }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="27" fill="currentColor" />
      <path d="M12 41V29l8-7 6 6 12-14 6 5-17 20-7-6-3 3v5h-5Z" fill="#075334" />
      <path d="M17 42h5V33l-5 5v4Zm9 0h5V28l-5 6v8Zm9 0h5V21l-5 6v15Z" fill="#075334" />
      <path d="m34 14 6-6 6 6" fill="none" stroke="#075334" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatMoney(amount, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatGoalMoney(amount, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount || 0);
}

function getGoalIcon(name) {
  const normalizedName = name.toLowerCase();
  if (/(car|vehicle|transport)/.test(normalizedName)) return 'car';
  if (/(education|school|tuition|study)/.test(normalizedName)) return 'education';
  return 'savings';
}

function getTrendPath(points) {
  if (!Array.isArray(points) || points.length < 2 || points.some((point) => !Number.isFinite(point))) {
    return null;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const spread = max - min || 1;
  const coordinates = points.map((point, index) => ({
    x: 4 + (index / (points.length - 1)) * 220,
    y: 96 - ((point - min) / spread) * 80,
  }));
  const line = coordinates.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
  const area = `${line} L${coordinates.at(-1).x} 108 L${coordinates[0].x} 108 Z`;

  return { line, area };
}

async function fetchDashboardData() {
  const [dashboardResponse, walletResponse] = await Promise.all([
    fetch('/api/dashboard', { credentials: 'include', headers: { Accept: 'application/json' } }),
    fetch('/api/wallet', { credentials: 'include', headers: { Accept: 'application/json' } }),
  ]);
  if (dashboardResponse.status === 401 || walletResponse.status === 401) {
    return { unauthorized: true };
  }
  if (!dashboardResponse.ok || !walletResponse.ok) {
    throw new Error('We could not load your dashboard. Please try again.');
  }

  const [dashboard, wallet] = await Promise.all([dashboardResponse.json(), walletResponse.json()]);
  return { dashboard: { ...dashboard, wallet }, unauthorized: false };
}

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(
    () => new URLSearchParams(location.search).get('createGoal') === '1',
  );
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [walletAction, setWalletAction] = useState('');
  const [walletActionError, setWalletActionError] = useState('');
  const [walletActionMessage, setWalletActionMessage] = useState('');
  const [withdrawalResult, setWithdrawalResult] = useState(null);
  const [isWalletActionPending, setIsWalletActionPending] = useState(false);
  const [banks, setBanks] = useState([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [withdrawalBankCode, setWithdrawalBankCode] = useState('');
  const [withdrawalStep, setWithdrawalStep] = useState(1);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [verifiedBankAccount, setVerifiedBankAccount] = useState(null);
  const [withdrawalRequestKey, setWithdrawalRequestKey] = useState('');
  const [error, setError] = useState('');
  const [hideBalance, setHideBalance] = useState(false);
  const handledPaymentReference = useRef('');

  const loadDashboard = useCallback(async () => {
    try {
      const result = await fetchDashboardData();
      if (result.unauthorized) {
        navigate('/login', { replace: true });
        return;
      }

      setError('');
      setDashboard(result.dashboard);
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'We could not reach GWIC. Check your connection and try again.'
        : requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    let isActive = true;

    async function loadInitialDashboard() {
      try {
        const result = await fetchDashboardData();
        if (!isActive) return;
        if (result.unauthorized) {
          navigate('/login', { replace: true });
          return;
        }
        setDashboard(result.dashboard);
      } catch (requestError) {
        if (isActive) {
          setError(requestError instanceof TypeError
            ? 'We could not reach GWIC. Check your connection and try again.'
            : requestError.message);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadInitialDashboard();
    return () => {
      isActive = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!dashboard || new URLSearchParams(location.search).get('createGoal') !== '1') return;

    document.getElementById('savings-goals')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    navigate('/dashboard', { replace: true });
  }, [dashboard, location.search, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (!dashboard || params.get('payment') !== 'paystack' || !reference || handledPaymentReference.current === reference) return;

    handledPaymentReference.current = reference;
    let isActive = true;
    async function verifyReturnedPayment() {
      setWalletActionMessage('Confirming your deposit with Paystack…');
      try {
        const response = await fetch('/api/wallet/deposits/verify', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ reference }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'We could not confirm this deposit yet.');
        if (!isActive) return;
        setWalletActionMessage('Deposit confirmed and added to your wallet.');
        await loadDashboard();
      } catch (requestError) {
        if (isActive) setWalletActionError(requestError.message);
      } finally {
        if (isActive) navigate('/dashboard', { replace: true });
      }
    }
    verifyReturnedPayment();
    return () => {
      isActive = false;
    };
  }, [dashboard, loadDashboard, location.search, navigate]);

  async function openWalletAction(action) {
    setWalletActionError('');
    setWalletActionMessage('');
    setWithdrawalResult(null);
    setWalletAction(action);
    if (action !== 'withdraw') return;

    setWithdrawalStep(1);
    setWithdrawalAmount('');
    setBankSearch('');
    setWithdrawalBankCode('');
    setVerifiedBankAccount(null);
    setWithdrawalRequestKey('');
    await loadBanks();
  }

  async function loadBanks() {
    setWalletActionError('');
    setIsLoadingBanks(true);
    try {
      const response = await fetch('/api/wallet/banks', { credentials: 'include', headers: { Accept: 'application/json' } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'We could not load the bank list.');
      setBanks(result.banks);
    } catch (requestError) {
      setWalletActionError(requestError instanceof TypeError
        ? 'We could not reach GWIC. Check your connection and try again.'
        : requestError.message);
    } finally {
      setIsLoadingBanks(false);
    }
  }

  async function handleWalletAction(event) {
    event.preventDefault();
    setWalletActionError('');
    setWalletActionMessage('');
    const formData = new FormData(event.currentTarget);
    const isDeposit = walletAction === 'deposit';
    if (!isDeposit && withdrawalStep === 1) {
      const amount = Number(formData.get('amount'));
      if (!Number.isSafeInteger(amount) || amount < 100) {
        setWalletActionError('The minimum withdrawal is ₦100.');
        return;
      }
      if (amount > Math.floor(dashboard.wallet.balance)) {
        setWalletActionError('The withdrawal amount cannot exceed your available wallet balance.');
        return;
      }
      setWithdrawalAmount(String(amount));
      setWithdrawalStep(2);
      return;
    }

    if (!isDeposit && withdrawalStep === 2) {
      setIsWalletActionPending(true);
      try {
        const response = await fetch('/api/wallet/withdrawals/resolve', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            accountNumber: formData.get('account-number'),
            bankCode: formData.get('bank-code'),
          }),
        });
        const result = await response.json();
        if (response.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        if (!response.ok) throw new Error(result.message || 'We could not verify this bank account.');
        setVerifiedBankAccount({
          accountNumber: formData.get('account-number'),
          bankCode: formData.get('bank-code'),
          ...result,
        });
        setWithdrawalRequestKey(crypto.randomUUID());
        setWithdrawalStep(3);
      } catch (requestError) {
        setWalletActionError(requestError instanceof TypeError
          ? 'We could not reach GWIC. Check your connection and try again.'
          : requestError.message);
      } finally {
        setIsWalletActionPending(false);
      }
      return;
    }

    setIsWalletActionPending(true);
    try {
      const response = await fetch(isDeposit ? '/api/wallet/deposits' : '/api/wallet/withdrawals', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(isDeposit
          ? { amount: Number(formData.get('amount')) }
          : {
            amount: Number(withdrawalAmount),
            accountNumber: verifiedBankAccount.accountNumber,
            bankCode: verifiedBankAccount.bankCode,
            password: formData.get('withdrawal-password'),
            idempotencyKey: withdrawalRequestKey,
          }),
      });
      const result = await response.json();
      if (response.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      if (!response.ok) throw new Error(result.message || 'We could not process this request.');
      if (isDeposit) {
        window.location.assign(result.authorizationUrl);
        return;
      }
      setWalletActionMessage(result.message);
      setWithdrawalResult({ reference: result.reference, status: result.status });
      setWalletAction('');
      setVerifiedBankAccount(null);
      setWithdrawalRequestKey('');
      await loadDashboard();
    } catch (requestError) {
      setWalletActionError(requestError instanceof TypeError
        ? 'We could not reach GWIC. Check your connection and try again.'
        : requestError.message);
    } finally {
      setIsWalletActionPending(false);
    }
  }

  async function handleCreateGoal(event) {
    event.preventDefault();
    setError('');
    setIsSavingGoal(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/dashboard/goals', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('goal-name'),
          targetAmount: Number(formData.get('target-amount')),
        }),
      });
      const result = await response.json();
      if (response.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(result.message || 'We could not create this goal.');
      }
      setIsGoalFormOpen(false);
      setIsGoalFormOpen(false);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'We could not reach GWIC. Check your connection and try again.'
        : requestError.message);
    } finally {
      setIsSavingGoal(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Logout could not be confirmed.');
      }
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <div className="dashboard-loading-shell">
        <div className="dashboard-loading-card">
          <DashboardLogo className="dashboard-loading-logo" />
          <p>Loading your secure dashboard…</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="dashboard-loading-shell">
        <div className="dashboard-loading-card dashboard-error-card" role="alert">
          <DashboardLogo className="dashboard-loading-logo" />
          <p>{error || 'Your dashboard is unavailable right now.'}</p>
          <button className="dashboard-button" onClick={loadDashboard} type="button">Try again</button>
        </div>
      </div>
    );
  }

  const firstName = dashboard.user.name.trim().split(/\s+/)[0];
  const initials = dashboard.user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const currency = dashboard.balances.currency;
  const displayAmount = (value) => hideBalance ? '••••••••' : formatMoney(value, currency);
  const monthlyChange = dashboard.performance?.monthlyChangePercent;
  const hasMonthlyChange = Number.isFinite(monthlyChange);
  const trendPath = hasMonthlyChange ? getTrendPath(dashboard.performance.chartPoints) : null;
  const performanceDirection = monthlyChange > 0 ? 'positive' : monthlyChange < 0 ? 'negative' : 'neutral';
  const recentActivity = [
    ...dashboard.recentActivity,
    ...dashboard.wallet.transactions.map((transaction) => ({
      id: transaction.reference,
      type: 'wallet',
      description: transaction.type === 'deposit' ? 'Wallet deposit' : 'Wallet withdrawal',
      source: transaction.bankName
        ? `${transaction.bankName}${transaction.accountLast4 ? ` ····${transaction.accountLast4}` : ''}`
        : 'Paystack wallet',
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      status: transaction.status,
      transactionType: transaction.type,
    })),
  ].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

  function scrollTo(target) {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="dashboard-app" id="dashboard-top">
      <header className="dashboard-header">
        <Link className="dashboard-brand" to="/" aria-label="GWIC home">
          <DashboardLogo className="dashboard-brand-mark" />
          <span><strong>GWIC</strong><small>GrowWithCore</small></span>
        </Link>
        <nav className="desktop-dashboard-nav" aria-label="Dashboard navigation">
          {navigation.map((item) => (
            <button key={item.label} onClick={() => (item.path ? navigate(item.path) : scrollTo(item.target))} type="button">
              <Icon name={item.icon} />{item.label}
            </button>
          ))}
        </nav>
        <div className="dashboard-profile">
          <button aria-label="Notifications are not available yet" className="notification-button" disabled type="button">
            <Icon name="bell" />
          </button>
          <div aria-label={`Signed in as ${dashboard.user.name}`} className="profile-avatar">{initials}</div>
          <button className="profile-name" onClick={handleLogout} type="button" disabled={isLoggingOut}>
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-welcome">
          <div>
            <h1>Welcome back, {firstName}</h1>
            <p>Let’s keep your goals moving forward.</p>
          </div>
          <span className="welcome-date">{new Intl.DateTimeFormat('en-NG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span>
        </section>

        {error && <p className="dashboard-message is-error" role="alert">{error}</p>}
        <section className="balance-card" aria-label="Wallet balance">
          <div className="balance-copy">
            <div className="balance-label-row">
              <span>Wallet Balance</span>
              <button
                aria-label={hideBalance ? 'Show balances' : 'Hide balances'}
                aria-pressed={hideBalance}
                className="balance-visibility"
                onClick={() => setHideBalance((hidden) => !hidden)}
                type="button"
              >
                <Icon name="eye" />
              </button>
            </div>
            <strong>{displayAmount(dashboard.wallet.balance)}</strong>
            <p>Confirmed wallet funds available to withdraw. Savings goals are shown separately.</p>
            {hasMonthlyChange && (
              <div className={`balance-performance is-${performanceDirection}`}>
                <span aria-hidden="true">{monthlyChange > 0 ? '+' : monthlyChange < 0 ? '−' : ''}{Math.abs(monthlyChange)}%</span>
                <small>{dashboard.performance.periodLabel || 'vs. last month'}</small>
              </div>
            )}
          </div>
          {trendPath && (
            <svg
              className={`balance-chart is-${performanceDirection}`}
              viewBox="0 0 230 110"
              preserveAspectRatio="none"
              aria-label={`Balance trend ${performanceDirection}`}
              role="img"
            >
              <defs>
                <linearGradient id="balance-chart-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
                <marker id="balance-chart-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0 0 8 4 0 8Z" fill="currentColor" />
                </marker>
              </defs>
              <path className="balance-chart-area" d={trendPath.area} />
              <path className="balance-chart-line" d={trendPath.line} markerEnd="url(#balance-chart-arrowhead)" />
            </svg>
          )}
        </section>

        <section className="quick-actions" aria-label="Account actions">
          {quickActions.map((action) => (
            <button
              className="quick-action"
              disabled={!action.available}
              key={action.label}
              onClick={() => {
                if (action.path) {
                  navigate(action.path);
                } else if (action.walletAction) {
                  openWalletAction(action.walletAction);
                } else {
                  setIsGoalFormOpen(true);
                  document.getElementById('savings-goals')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              type="button"
            >
              <span className="quick-action-icon"><Icon name={action.icon} /></span>
              <span>{action.label}</span>
            </button>
          ))}
        </section>

        {walletActionMessage && (
          <div className="dashboard-message is-success wallet-action-result" role="status">
            <span>{walletActionMessage}</span>
            {withdrawalResult?.reference && <small>Reference: {withdrawalResult.reference}</small>}
            {withdrawalResult?.status && <small>Status: {withdrawalResult.status.replaceAll('_', ' ')}</small>}
            {withdrawalResult?.reference && <Link to="/activity">View activity</Link>}
          </div>
        )}
        {walletActionError && !walletAction && <p className="dashboard-message is-error" role="alert">{walletActionError}</p>}

        {walletAction && (
          <div className="wallet-dialog-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setWalletAction('');
              setVerifiedBankAccount(null);
              setWithdrawalRequestKey('');
            }
          }}>
            <section aria-labelledby="wallet-dialog-title" aria-modal="true" className={`wallet-dialog ${walletAction === 'withdraw' ? 'is-withdrawal' : ''}`} role="dialog">
              <button aria-label="Close" className="wallet-dialog-close" onClick={() => { setWalletAction(''); setVerifiedBankAccount(null); setWithdrawalRequestKey(''); }} type="button">×</button>
              <h2 id="wallet-dialog-title">{walletAction === 'deposit' ? 'Add money to your wallet' : 'Withdraw to your bank'}</h2>
              <p>{walletAction === 'deposit'
                ? 'You’ll complete payment securely on Paystack. Your wallet is credited only after payment is confirmed.'
                : 'Withdraw securely to a Nigerian bank account in your name.'}</p>
              {walletAction === 'withdraw' && (
                <>
                  <div aria-label={`Withdrawal step ${withdrawalStep} of 3`} className="withdrawal-steps">
                    {['Amount', 'Bank account', 'Review'].map((step, index) => (
                      <div className={withdrawalStep >= index + 1 ? 'is-current' : ''} key={step}>
                        <span>{index + 1}</span><small>{step}</small>
                      </div>
                    ))}
                  </div>
                  <div className="withdrawal-balance">
                    <span>Available to withdraw</span>
                    <strong>{formatMoney(dashboard.wallet.balance, currency)}</strong>
                    <small>Only confirmed wallet funds are available.</small>
                  </div>
                </>
              )}
              <form className="wallet-action-form" onSubmit={handleWalletAction}>
                {(walletAction === 'deposit' || withdrawalStep === 1) && (
                  <>
                    <label>
                      Amount (₦)
                      <input
                        autoComplete="off"
                        autoFocus={walletAction === 'deposit' || withdrawalStep === 1}
                        inputMode="numeric"
                        max={walletAction === 'deposit' ? '1000000' : String(Math.floor(dashboard.wallet.balance))}
                        min="100"
                        name="amount"
                        onChange={walletAction === 'withdraw' ? (event) => setWithdrawalAmount(event.target.value) : undefined}
                        placeholder="₦100 minimum"
                        required
                        step="1"
                        type="number"
                        value={walletAction === 'withdraw' ? withdrawalAmount : undefined}
                      />
                    </label>
                    {walletAction === 'withdraw' && (
                      <>
                        <button
                          className="withdrawal-max-button"
                          disabled={dashboard.wallet.balance < 100}
                          onClick={() => setWithdrawalAmount(String(Math.floor(dashboard.wallet.balance)))}
                          type="button"
                        >
                          Withdraw full balance
                        </button>
                        <p className="withdrawal-inline-note">Minimum withdrawal ₦100. No fee or delivery time is shown until confirmed by the provider.</p>
                      </>
                    )}
                  </>
                )}
                {walletAction === 'withdraw' && withdrawalStep === 2 && (
                  <>
                    <div className="withdrawal-amount-summary">
                      <span>Withdrawal amount</span>
                      <strong>{formatMoney(Number(withdrawalAmount), currency)}</strong>
                      <button onClick={() => { setWithdrawalStep(1); setVerifiedBankAccount(null); }} type="button">Change amount</button>
                    </div>
                    <p className="withdrawal-name-guidance">The bank account name must match your profile name: <strong>{dashboard.user.name}</strong>.</p>
                    <label>
                      Search banks
                      <input
                        autoComplete="off"
                        name="bank-search"
                        onChange={(event) => {
                          setBankSearch(event.target.value);
                          setWithdrawalBankCode('');
                        }}
                        placeholder="Type a bank name"
                        type="search"
                        value={bankSearch}
                      />
                    </label>
                    <label>
                      Bank
                      <select
                        name="bank-code"
                        onChange={(event) => {
                          setWithdrawalBankCode(event.target.value);
                          setBankSearch('');
                        }}
                        required
                        value={withdrawalBankCode}
                        disabled={isLoadingBanks || banks.length === 0}
                      >
                        <option value="">{isLoadingBanks ? 'Loading banks…' : 'Select your bank'}</option>
                        {banks
                          .filter((bank) => bank.name.toLowerCase().includes(bankSearch.trim().toLowerCase()))
                          .map((bank) => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
                      </select>
                      {!isLoadingBanks && bankSearch && !banks.some((bank) => bank.name.toLowerCase().includes(bankSearch.trim().toLowerCase())) && (
                        <small className="wallet-name-check">No banks match “{bankSearch}”. Try another name.</small>
                      )}
                    </label>
                    {!isLoadingBanks && banks.length === 0 && (
                      <button className="withdrawal-back-button" onClick={loadBanks} type="button">Retry loading banks</button>
                    )}
                    <label>
                      10-digit account number
                      <input autoComplete="off" inputMode="numeric" maxLength="10" minLength="10" name="account-number" pattern="[0-9]{10}" placeholder="Enter account number" required />
                    </label>
                    <small className="wallet-name-check">We verify the account name with Paystack. No funds move during verification.</small>
                  </>
                )}
                {walletAction === 'withdraw' && withdrawalStep === 3 && verifiedBankAccount && (
                  <>
                    <div className="withdrawal-review-amount">
                      <small>Amount to withdraw</small>
                      <strong>{formatMoney(Number(withdrawalAmount), currency)}</strong>
                      <span>This exact amount will be reserved from your wallet when you confirm.</span>
                    </div>
                    <div className="withdrawal-recipient">
                      <span className="withdrawal-recipient-icon"><Icon name="withdraw" /></span>
                      <div>
                        <small>Verified bank account</small>
                        <strong>{verifiedBankAccount.accountName}</strong>
                        <span>{verifiedBankAccount.bankName} ····{verifiedBankAccount.accountLast4}</span>
                      </div>
                      <span aria-label="Verified" className="withdrawal-verified-mark">✓</span>
                    </div>
                    <p className="withdrawal-security-note">For your security, confirm with your password. Your bank details are checked again before payout.</p>
                    <label>
                      GWIC password
                      <input autoComplete="current-password" name="withdrawal-password" required type="password" />
                    </label>
                    <button className="withdrawal-back-button" onClick={() => { setWithdrawalStep(2); setVerifiedBankAccount(null); setWithdrawalRequestKey(''); }} type="button">Back to bank details</button>
                  </>
                )}
                {walletActionError && <p className="dashboard-message is-error" role="alert">{walletActionError}</p>}
                <button className="dashboard-button" disabled={isWalletActionPending || (walletAction === 'withdraw' && withdrawalStep === 2 && (isLoadingBanks || banks.length === 0))} type="submit">
                  {isWalletActionPending
                    ? walletAction === 'withdraw' && withdrawalStep === 2 ? 'Verifying account…' : 'Processing…'
                    : walletAction === 'deposit' ? 'Continue to Paystack'
                      : withdrawalStep === 1 ? 'Continue'
                        : withdrawalStep === 2 ? 'Verify bank account'
                          : 'Confirm withdrawal'}
                </button>
              </form>
            </section>
          </div>
        )}

        <section className="account-balances" id="account-balances" aria-label="Savings goals and investments">
          <article className="account-balance-card">
            <span className="account-category-icon"><Icon name="savings" /></span>
            <div className="account-balance-copy">
              <span>Savings goals</span>
              <strong>{displayAmount(dashboard.balances.savings)}</strong>
              <small>Recorded goal progress, not wallet funds</small>
            </div>
            <Icon name="chevron" />
          </article>
          <article className="account-balance-card">
            <span className="account-category-icon is-investment"><Icon name="invest" /></span>
            <div className="account-balance-copy">
              <span>Investments</span>
              <strong>{dashboard.balances.investments === null ? '—' : displayAmount(dashboard.balances.investments)}</strong>
              {dashboard.balances.investments === null && <small>Not connected</small>}
            </div>
            <Icon name="chevron" />
          </article>
        </section>

        <section className="dashboard-section" id="savings-goals">
          <div className="section-heading">
            <h2>Your Savings Goals</h2>
            <button
              className="text-action"
              onClick={() => setShowAllGoals((showing) => !showing)}
              type="button"
              disabled={dashboard.savingsGoals.length <= 3}
            >
              {showAllGoals ? 'Show less' : 'View all'} <Icon name="chevron" />
            </button>
          </div>

          {isGoalFormOpen && (
            <form className="goal-form" onSubmit={handleCreateGoal}>
              <label>
                Goal name
                <input autoComplete="off" maxLength="80" name="goal-name" placeholder="Enter a goal name" required />
              </label>
              <label>
                Target amount (₦)
                <input min="1" name="target-amount" placeholder="Enter an amount" required step="1" type="number" />
              </label>
              <button className="dashboard-button" disabled={isSavingGoal} type="submit">
                {isSavingGoal ? 'Saving goal…' : 'Save goal'}
              </button>
            </form>
          )}

          {dashboard.savingsGoals.length ? (
            <div className="goal-list">
              {(showAllGoals ? dashboard.savingsGoals : dashboard.savingsGoals.slice(0, 3)).map((goal) => (
                <article className="goal-card" key={goal.id}>
                  <span className="goal-icon"><Icon name={getGoalIcon(goal.name)} /></span>
                  <div className="goal-information">
                    <strong>{goal.name}</strong>
                    <span>{formatGoalMoney(goal.savedAmount, currency)} <span className="goal-target">/ {formatGoalMoney(goal.targetAmount, currency)}</span></span>
                    <div aria-label={`${goal.progress}% complete`} className="goal-progress"><span style={{ width: `${goal.progress}%` }} /></div>
                  </div>
                  <span className="goal-percentage">{goal.progress}%</span>
                  <Icon name="chevron" />
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-card">
              <span className="goal-icon"><Icon name="savings" /></span>
              <div>
                <strong>No savings goals yet</strong>
                <p>Your savings goals will appear here once you create one.</p>
              </div>
              <button className="dashboard-button" onClick={() => setIsGoalFormOpen(true)} type="button">Create a goal</button>
            </div>
          )}
        </section>

        <section className="dashboard-section recent-section" id="recent-activity">
          <div className="section-heading">
            <h2>Recent Activity</h2>
            <Link className="text-action" to="/activity">
              See all <Icon name="chevron" />
            </Link>
          </div>
          {recentActivity.length ? (
            <div className="activity-list">
              {recentActivity.slice(0, 2).map((item) => (
                <article className="activity-card" key={item.id}>
                  <span className={`activity-icon ${item.type === 'investment' ? 'is-investment' : ''}`}><Icon name={item.type === 'investment' ? 'invest' : 'portfolio'} /></span>
                  <div className="activity-description">
                    <strong>{item.description}</strong>
                    <small>{item.source || 'GWIC account'}</small>
                  </div>
                  <div className="activity-amount">
                    <strong>{item.transactionType === 'withdrawal' ? '−' : item.transactionType === 'deposit' ? '+' : ''}{displayAmount(item.amount)}</strong>
                    <small>{new Date(item.createdAt).toLocaleString()}</small>
                    {item.status && <small className={`wallet-transaction-status is-${item.status}`}>{item.status.replaceAll('_', ' ')}</small>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-card activity-empty">
              <span className="goal-icon"><Icon name="portfolio" /></span>
              <div>
                <strong>No activity to show</strong>
                <p>Your deposits and completed transactions will appear here.</p>
              </div>
            </div>
          )}
        </section>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile dashboard navigation">
        {navigation.map((item, index) => (
          <button
            className={index === 0 ? 'is-active' : ''}
            key={item.label}
            onClick={() => (item.path ? navigate(item.path) : scrollTo(item.target))}
            type="button"
          >
            <Icon name={item.icon} /><span>{item.label}</span>
          </button>
        ))}
        <button aria-label="More options are not available yet" disabled type="button">
          <Icon name="more" /><span>More</span>
        </button>
      </nav>
    </div>
  );
}

export default Dashboard;
