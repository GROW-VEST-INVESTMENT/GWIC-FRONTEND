import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const navigation = [
  { label: 'Home', icon: 'home', target: 'dashboard-top' },
  { label: 'Core Lock', icon: 'lock', path: '/core-lock' },
  { label: 'Invest', icon: 'invest', target: 'account-balances' },
  { label: 'Portfolio', icon: 'portfolio', target: 'recent-activity' },
];

const quickActions = [
  { label: 'Deposit', icon: 'deposit', available: false },
  { label: 'Withdraw', icon: 'withdraw', available: false },
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
  const response = await fetch('/api/dashboard', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (response.status === 401) {
    return { unauthorized: true };
  }
  if (!response.ok) {
    throw new Error('We could not load your dashboard. Please try again.');
  }

  return { dashboard: await response.json(), unauthorized: false };
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
  const [error, setError] = useState('');
  const [hideBalance, setHideBalance] = useState(false);

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
        <section className="balance-card" aria-label="Account balance">
          <div className="balance-copy">
            <div className="balance-label-row">
              <span>Total Balance</span>
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
            <strong>{displayAmount(dashboard.balances.total)}</strong>
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

        <section className="account-balances" id="account-balances" aria-label="Savings and investment balances">
          <article className="account-balance-card">
            <span className="account-category-icon"><Icon name="savings" /></span>
            <div className="account-balance-copy">
              <span>Savings</span>
              <strong>{displayAmount(dashboard.balances.savings)}</strong>
              <small>From your savings goals</small>
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
            {dashboard.recentActivity.length > 0 && (
              <button className="text-action" type="button" disabled>
                View all <Icon name="chevron" />
              </button>
            )}
          </div>
          {dashboard.recentActivity.length ? (
            <div className="activity-list">
              {dashboard.recentActivity.map((item) => (
                <article className="activity-card" key={item.id}>
                  <span className={`activity-icon ${item.type === 'investment' ? 'is-investment' : ''}`}><Icon name={item.type === 'investment' ? 'invest' : 'portfolio'} /></span>
                  <div className="activity-description">
                    <strong>{item.description}</strong>
                    <small>{item.source || 'GWIC account'}</small>
                  </div>
                  <div className="activity-amount">
                    <strong>{displayAmount(item.amount)}</strong>
                    <small>{new Date(item.createdAt).toLocaleString()}</small>
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
