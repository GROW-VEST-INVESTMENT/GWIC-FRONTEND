import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Dashboard/Dashboard.css';
import './Activity.css';

const filters = [
  { label: 'All activity', value: 'all' },
  { label: 'Deposits', value: 'deposit' },
  { label: 'Withdrawals', value: 'withdrawal' },
];

function ActivityIcon({ type }) {
  return (
    <span aria-hidden="true" className={`activity-page-icon is-${type}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {type === 'deposit'
          ? <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 17v4h14v-4" /></>
          : <><path d="M12 21V9m-5 5 5-5 5 5" /><path d="M5 7V3h14v4" /></>}
      </svg>
    </span>
  );
}

function ActivityNavIcon({ name }) {
  const paths = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    invest: <><path d="M3 20h18M5 17v-5h3v5m3 0V9h3v8m3 0V5h3v12" /><path d="m5 9 5-4 4 2 6-5" /></>,
    portfolio: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M8 16h2l2-3 2 2 3-4" /></>,
    more: <path d="M3 6h18M3 12h18M3 18h18" />,
  };

  return (
    <svg aria-hidden="true" className="activity-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  }).format(amount);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function Activity() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadActivity() {
      setIsLoading(true);
      setTransactions([]);
      setError('');
      try {
        const query = new URLSearchParams({ page: '1', type: filter });
        const response = await fetch(`/api/wallet/transactions?${query}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        if (response.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'We could not load your activity.');
        setTransactions(result.transactions);
        setPage(result.page);
        setHasMore(result.hasMore);
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setError(requestError instanceof TypeError
          ? 'We could not reach GWIC. Check your connection and try again.'
          : requestError.message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadActivity();
    return () => controller.abort();
  }, [filter, navigate, retryKey]);

  async function loadMore() {
    setIsLoadingMore(true);
    setError('');
    try {
      const nextPage = page + 1;
      const query = new URLSearchParams({ page: String(nextPage), type: filter });
      const response = await fetch(`/api/wallet/transactions?${query}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (response.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'We could not load more activity.');
      setTransactions((current) => [...current, ...result.transactions]);
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'We could not reach GWIC. Check your connection and try again.'
        : requestError.message);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div className="dashboard-app activity-page">
      <header className="dashboard-header">
        <Link className="dashboard-brand" to="/dashboard" aria-label="Back to dashboard">
          <svg aria-hidden="true" className="dashboard-brand-mark" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="27" fill="currentColor" />
            <path d="M12 41V29l8-7 6 6 12-14 6 5-17 20-7-6-3 3v5h-5Z" fill="#075334" />
            <path d="M17 42h5V33l-5 5v4Zm9 0h5V28l-5 6v8Zm9 0h5V21l-5 6v15Z" fill="#075334" />
            <path d="m34 14 6-6 6 6" fill="none" stroke="#075334" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span><strong>GWIC</strong><small>GrowWithCore</small></span>
        </Link>
        <nav aria-label="Account navigation" className="desktop-dashboard-nav">
          <Link to="/dashboard">Dashboard</Link>
          <span aria-current="page">Activity</span>
          <Link to="/more">More</Link>
        </nav>
        <Link className="activity-header-back" to="/dashboard">Back to dashboard</Link>
      </header>

      <main className="activity-content">
        <section className="activity-intro">
          <Link className="activity-back-link" to="/dashboard">← Dashboard</Link>
          <div className="activity-title-row">
            <span className="activity-title-mark">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="5" width="16" height="16" rx="2" />
                <path d="M8 3v4m8-4v4M8 16h2l2-3 2 2 3-4" />
              </svg>
            </span>
            <div>
              <h1>Activity</h1>
              <p>Your deposits and withdrawals, all in one place.</p>
            </div>
          </div>
        </section>

        <section aria-label="Activity filters and history" className="activity-panel">
          <div className="activity-panel-heading">
            <div>
              <h2>Transaction history</h2>
              <p>Newest activity appears first.</p>
            </div>
            <span className="activity-secure-label">Secure wallet history</span>
          </div>

          <div aria-label="Filter activity" className="activity-filters" role="group">
            {filters.map((item) => (
              <button
                aria-pressed={filter === item.value}
                className={filter === item.value ? 'is-selected' : ''}
                key={item.value}
                onClick={() => setFilter(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="activity-state is-error" role="alert">
              <p>{error}</p>
              <button onClick={() => setRetryKey((key) => key + 1)} type="button">Try again</button>
            </div>
          )}

          {isLoading ? (
            <div aria-live="polite" className="activity-state">Loading your activity…</div>
          ) : transactions.length ? (
            <>
              <div aria-live="polite" className="activity-history-list">
                {transactions.map((transaction) => (
                  <article className="activity-history-item" key={transaction.reference}>
                    <ActivityIcon type={transaction.type} />
                    <div className="activity-history-description">
                      <strong>{transaction.type === 'deposit' ? 'Wallet deposit' : 'Wallet withdrawal'}</strong>
                      <span>
                        {transaction.bankName
                          ? `${transaction.bankName}${transaction.accountLast4 ? ` ····${transaction.accountLast4}` : ''}`
                          : 'Paystack wallet'}
                      </span>
                      <time dateTime={transaction.createdAt}>{formatDate(transaction.createdAt)}</time>
                    </div>
                    <div className="activity-history-amount">
                      <strong className={`is-${transaction.type}`}>
                        {transaction.type === 'withdrawal' ? '−' : '+'}{formatMoney(transaction.amount)}
                      </strong>
                      <span className={`activity-status is-${transaction.status}`}>
                        {transaction.status.replaceAll('_', ' ')}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
              {hasMore && (
                <button className="activity-load-more" disabled={isLoadingMore} onClick={loadMore} type="button">
                  {isLoadingMore ? 'Loading more…' : 'Load more activity'}
                </button>
              )}
            </>
          ) : (
            <div className="activity-empty-state">
              <span className="activity-empty-icon">↗</span>
              <h3>
                {filter === 'all'
                  ? 'No activity yet'
                  : `No ${filter === 'deposit' ? 'deposits' : 'withdrawals'} yet`}
              </h3>
              <p>Your wallet transactions will appear here when they happen.</p>
              <Link to="/dashboard">Return to dashboard</Link>
            </div>
          )}
        </section>
        <p className="activity-footnote">Your activity is private and only visible to you.</p>
      </main>

      <nav aria-label="Mobile account navigation" className="activity-mobile-nav">
        <Link to="/dashboard"><ActivityNavIcon name="home" /><span>Home</span></Link>
        <Link to="/core-lock"><ActivityNavIcon name="lock" /><span>Core Lock</span></Link>
        <Link to="/dashboard#account-balances"><ActivityNavIcon name="invest" /><span>Invest</span></Link>
        <Link aria-current="page" to="/activity"><ActivityNavIcon name="portfolio" /><span>Portfolio</span></Link>
        <Link to="/more"><ActivityNavIcon name="more" /><span>More</span></Link>
      </nav>
    </div>
  );
}

export default Activity;
