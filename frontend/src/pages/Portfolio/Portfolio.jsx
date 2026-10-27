import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import './Portfolio.css';

const tabs = ['Overview', 'Savings', 'Investments', 'Performance'];
const bottomNavigation = [
  { label: 'Home', icon: 'home', to: '/dashboard' },
  { label: 'Core Lock', icon: 'lock', to: '/core-lock' },
  { label: 'Invest', icon: 'invest', to: '/dashboard#account-balances' },
  { label: 'Portfolio', icon: 'portfolio', to: '/portfolio' },
  { label: 'More', icon: 'more', to: '/more' },
];

function PortfolioIcon({ name }) {
  const paths = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    invest: <><path d="M3 20h18M5 17v-5h3v5m3 0V9h3v8m3 0V5h3v12" /><path d="m5 9 5-4 4 2 6-5" /></>,
    portfolio: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M8 16h2l2-3 2 2 3-4" /></>,
    more: <path d="M3 6h18M3 12h18M3 18h18" />,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    wallet: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 9h18m-5 5h2m-13-8 2-3h11l2 3" /></>,
    savings: <><ellipse cx="12" cy="7" rx="8" ry="3" /><path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    lockSmall: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  };

  return (
    <svg aria-hidden="true" className={`portfolio-icon is-${name}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(value));
}

function Portfolio() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [balancesVisible, setBalancesVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPortfolio() {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/portfolio', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        if (response.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'We could not load your portfolio.');
        setPortfolio(result);
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setError(requestError instanceof TypeError
          ? 'We could not reach GWIC. Check your connection and try again.'
          : requestError.message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadPortfolio();
    return () => controller.abort();
  }, [navigate, retryCount]);

  const allocation = useMemo(() => {
    const items = (portfolio?.allocations || []).filter((item) => item.amount > 0);
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return items.reduce((sections, item, index) => {
      const offset = sections.at(-1)?.end || 0;
      const percentage = total > 0 ? (item.amount / total) * 100 : 0;
      sections.push({
        ...item,
        percentage,
        start: offset,
        end: offset + percentage,
        color: {
          'core-target': '#35bb32',
          'core-lock': '#087849',
          cash: '#1ea3cc',
        }[item.type] || ['#087849', '#8be348', '#1ea3cc', '#7651bd'][index % 4],
      });
      return sections;
    }, []);
  }, [portfolio]);

  const filteredHoldings = useMemo(() => {
    const holdings = portfolio?.holdings || [];
    if (activeTab === 'Savings') return holdings.filter((item) => item.type === 'CORE_TARGET');
    if (activeTab === 'Investments') return holdings.filter((item) => item.type === 'CORE_LOCK');
    return holdings;
  }, [activeTab, portfolio]);

  const allocationGradient = allocation.length
    ? `conic-gradient(${allocation.map((item) => `${item.color} ${item.start}% ${item.end}%`).join(', ')})`
    : 'conic-gradient(#e6eee9 0% 100%)';

  return (
    <div className="portfolio-page">
      <header className="portfolio-header">
        <Link className="portfolio-brand" to="/dashboard" aria-label="GWIC home">
          <span aria-hidden="true" className="portfolio-brand-mark"><BrandMark className="portfolio-brand-symbol" /></span>
          <span><strong>GWIC</strong><small>GrowWithCore</small></span>
        </Link>
        <nav aria-label="Main navigation" className="portfolio-desktop-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/core-lock">Core Lock</Link>
          <Link aria-current="page" to="/portfolio">Portfolio</Link>
          <Link to="/more">More</Link>
        </nav>
        <div className="portfolio-header-actions">
          <button aria-label="Notifications are not available yet" className="portfolio-notification-button" disabled type="button">
            <PortfolioIcon name="bell" />
          </button>
          <Link aria-label="Account settings" className="portfolio-profile-button" to="/more"><PortfolioIcon name="user" /></Link>
        </div>
      </header>

      <section className="portfolio-hero">
        <div className="portfolio-hero-inner">
          <h1>Portfolio Overview</h1>
          <p>Track your savings and available balance in one place.</p>
          <nav aria-label="Portfolio sections" className="portfolio-tabs">
            {tabs.map((tab) => (
              <button aria-current={activeTab === tab ? 'page' : undefined} className={activeTab === tab ? 'is-active' : ''} key={tab} onClick={() => setActiveTab(tab)} type="button">
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </section>

      <main className="portfolio-main">
        <div className="portfolio-content-surface">
          {error && (
            <div className="portfolio-error" role="alert">
              <p>{error}</p>
              <button onClick={() => setRetryCount((count) => count + 1)} type="button">Try again</button>
            </div>
          )}

          <section aria-label="Total portfolio value" className="portfolio-value-card">
            <div className="portfolio-value-copy">
              <div className="portfolio-value-label-row">
                <span>Total Portfolio Value</span>
                <button aria-label={balancesVisible ? 'Hide portfolio balances' : 'Show portfolio balances'} aria-pressed={!balancesVisible} className="portfolio-eye-button" onClick={() => setBalancesVisible((visible) => !visible)} type="button">
                  <PortfolioIcon name="eye" />
                </button>
              </div>
              <strong aria-live="polite">{isLoading ? 'Loading…' : balancesVisible ? formatMoney(portfolio?.portfolioValue) : '₦••••••••'}</strong>
              <p className="portfolio-value-gain">
                <PortfolioIcon name="arrow" />
                {isLoading ? 'Loading Core savings accrual…' : balancesVisible
                  ? `${formatMoney(portfolio?.accruedYield)} accrued Core savings yield`
                  : 'Core savings yield hidden'}
              </p>
              <small>Wallet balance plus active Core savings value</small>
            </div>
          </section>

          <section aria-label="Portfolio summary" className="portfolio-summary-grid">
            <article className="portfolio-summary-card">
              <span className="portfolio-summary-icon"><PortfolioIcon name="savings" /></span>
              <span>Total Invested</span>
              <strong>{isLoading ? '—' : balancesVisible ? formatMoney(portfolio?.investedPrincipal) : '₦••••••'}</strong>
            </article>
            <article className="portfolio-summary-card">
              <span className="portfolio-summary-icon"><PortfolioIcon name="invest" /></span>
              <span>Total Gain/Loss</span>
              <strong>{isLoading ? '—' : balancesVisible ? formatMoney(portfolio?.accruedYield) : '₦••••••'}</strong>
              <small>Accrued Core savings yield</small>
            </article>
            <article className="portfolio-summary-card">
              <span className="portfolio-summary-icon"><PortfolioIcon name="wallet" /></span>
              <span>Available Balance</span>
              <strong>{isLoading ? '—' : balancesVisible ? formatMoney(portfolio?.availableBalance) : '₦••••••'}</strong>
            </article>
          </section>

          <section aria-labelledby="portfolio-allocation-heading" className="portfolio-panel portfolio-allocation-panel">
            <div className="portfolio-section-heading">
              <div><h2 id="portfolio-allocation-heading">Portfolio Allocation</h2></div>
              <button className="portfolio-text-action" onClick={() => document.getElementById('portfolio-holdings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} type="button">View Details <PortfolioIcon name="arrow" /></button>
            </div>
            <div className="portfolio-allocation-content">
              <div aria-label="Allocation chart" className="portfolio-donut" style={{ background: allocationGradient }}>
                <div className="portfolio-donut-hole">
                  <strong>{isLoading ? '—' : balancesVisible ? formatCompact(portfolio?.portfolioValue) : '₦••••'}</strong>
                  <span>Total Value</span>
                </div>
              </div>
              <div className="portfolio-allocation-legend">
                {allocation.map((item) => (
                  <div className="portfolio-allocation-row" key={item.type}>
                    <span aria-hidden="true" className="portfolio-allocation-dot" style={{ backgroundColor: item.color }} />
                    <span className="portfolio-allocation-name">{item.label}</span>
                    <strong>{isLoading ? '—' : `${item.percentage.toFixed(1)}%`}</strong>
                    <span>{isLoading ? '—' : balancesVisible ? formatMoney(item.amount) : '₦••••'}</span>
                  </div>
                ))}
                {!isLoading && portfolio && portfolio.portfolioValue === 0 && <p className="portfolio-allocation-empty">Add funds or start an available savings plan to see your allocation.</p>}
              </div>
            </div>
          </section>

          <section aria-labelledby="portfolio-holdings-heading" className="portfolio-panel portfolio-holdings-panel" id="portfolio-holdings">
            <div className="portfolio-section-heading portfolio-holdings-heading">
              <div><h2 id="portfolio-holdings-heading">Holdings</h2></div>
              <span className="portfolio-holdings-count">{isLoading ? '—' : `${filteredHoldings.length} plans`}</span>
            </div>
            <div aria-label="Filter holdings" className="portfolio-holding-filters" role="group">
              {['Overview', 'Savings', 'Investments'].map((tab) => (
                <button aria-pressed={activeTab === tab} className={activeTab === tab ? 'is-active' : ''} key={tab} onClick={() => setActiveTab(tab)} type="button">
                  {tab === 'Overview' ? 'All' : tab === 'Savings' ? 'Core Target' : 'Core Lock'}
                </button>
              ))}
            </div>
            <div className="portfolio-holdings-table" role="table" aria-label="Your active Core savings">
              <div className="portfolio-holding-row is-table-header" role="row">
                <span role="columnheader">Asset / Plan</span><span role="columnheader">Principal</span><span role="columnheader">Current Value</span><span role="columnheader">Yield</span><span role="columnheader">Maturity</span>
              </div>
              {isLoading ? (
                <div className="portfolio-empty-state" role="row">Loading your active plans…</div>
              ) : filteredHoldings.length ? filteredHoldings.map((holding) => (
                <article className="portfolio-holding-row" key={holding.id} role="row">
                  <span className="portfolio-holding-product"><span className="portfolio-holding-icon"><PortfolioIcon name="lockSmall" /></span><span><strong>{holding.name}</strong><small>{holding.lockPeriodDays}-day term</small></span></span>
                  <span data-label="Principal">{balancesVisible ? formatMoney(holding.principal) : '₦••••••'}</span>
                  <span data-label="Current Value">{balancesVisible ? formatMoney(holding.currentValue) : '₦••••••'}</span>
                  <span data-label="Yield">{balancesVisible ? formatMoney(holding.accruedYield) : '₦••••••'}</span>
                  <span data-label="Maturity">{formatDate(holding.maturityDate)}</span>
                </article>
              )) : (
                <div className="portfolio-empty-state">
                  <span className="portfolio-empty-mark"><PortfolioIcon name="savings" /></span>
                  <h3>{activeTab === 'Investments' ? 'No active Core Lock plans' : activeTab === 'Savings' ? 'No active Core Target plans' : 'No active holdings yet'}</h3>
                  <p>Only your active GWIC savings plans appear here. Stock holdings aren’t available in your account yet.</p>
                  <Link to="/core-lock">Explore Core savings <PortfolioIcon name="arrow" /></Link>
                </div>
              )}
            </div>
          </section>

          {activeTab === 'Performance' && (
          <section aria-label="Portfolio performance" className="portfolio-performance-note">
            <span className="portfolio-performance-mark"><PortfolioIcon name="invest" /></span>
            <div><h2>Performance history isn’t available yet</h2><p>This portfolio shows your current wallet balance and active Core savings accruals. Historical market returns and 30-day performance tracking are not available.</p></div>
          </section>
          )}

          <Link className="portfolio-growth-note" to="/core-lock">
          <span className="portfolio-growth-mark">↗</span>
          <span><strong>Your portfolio, clearly explained</strong><small>Only balances and active plans recorded in your GWIC account are included.</small></span>
          <PortfolioIcon name="arrow" />
          </Link>
        </div>
      </main>

      <nav aria-label="Mobile account navigation" className="portfolio-mobile-nav">
        {bottomNavigation.map((item) => (
          <Link aria-current={item.label === 'Portfolio' ? 'page' : undefined} key={item.label} to={item.to}>
            <PortfolioIcon name={item.icon} /><span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function formatCompact(amount = 0) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export default Portfolio;
