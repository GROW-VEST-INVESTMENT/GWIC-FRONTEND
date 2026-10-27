import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import { readApiResponse } from '../../utils/readApiResponse';
import './PortfolioAllocation.css';

const allocationCategories = [
  { type: 'stocks', label: 'Stocks', color: '#087849' },
  { type: 'money-market-funds', label: 'Money Market Funds', color: '#35bb32' },
  { type: 't-bills', label: 'T-Bills', color: '#1ea3cc' },
  { type: 'core-target', label: 'Core Target', color: '#35bb32' },
  { type: 'core-lock', label: 'Core Lock', color: '#087849' },
  { type: 'savings', label: 'Savings', color: '#7651bd' },
  { type: 'cash', label: 'Cash Balance', color: '#1ea3cc' },
];

function formatMoney(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function PortfolioAllocation() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
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
        setPortfolio(await readApiResponse(response, 'We could not load your portfolio allocation.'));
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
    const availableAllocations = portfolio?.allocations || [];
    const allocationByType = new Map(availableAllocations.map((item) => [item.type, item]));
    const rows = allocationCategories.map((category) => ({
      ...category,
      ...allocationByType.get(category.type),
      connected: allocationByType.has(category.type),
    }));
    const total = rows.reduce((sum, item) => sum + (item.connected ? item.amount : 0), 0);

    return rows.map((item) => ({
      ...item,
      percentage: item.connected && total > 0 ? (item.amount / total) * 100 : 0,
    }));
  }, [portfolio]);

  return (
    <div className="portfolio-allocation-page">
      <header className="portfolio-allocation-header">
        <Link className="portfolio-allocation-brand" to="/dashboard" aria-label="GWIC home">
          <span aria-hidden="true"><BrandMark /></span>
          <span><strong>GWIC</strong><small>GrowWithCore</small></span>
        </Link>
        <Link className="portfolio-allocation-back" to="/portfolio">Back to portfolio</Link>
      </header>

      <main className="portfolio-allocation-main">
        <div className="portfolio-allocation-title">
          <Link to="/portfolio">Portfolio</Link>
          <h1>Portfolio allocation</h1>
          <p>See how your current GWIC account value is distributed.</p>
        </div>

        {error && (
          <div className="portfolio-allocation-error" role="alert">
            <p>{error}</p>
            <button onClick={() => setRetryCount((count) => count + 1)} type="button">Try again</button>
          </div>
        )}

        <section className="portfolio-allocation-total" aria-label="Total portfolio value">
          <span>Total portfolio value</span>
          <strong>{isLoading ? 'Loading…' : formatMoney(portfolio?.portfolioValue)}</strong>
          <small>Wallet balance and active Core savings value</small>
        </section>

        <section aria-labelledby="allocation-breakdown-title" className="portfolio-allocation-breakdown">
          <div className="portfolio-allocation-breakdown-heading">
            <div>
              <h2 id="allocation-breakdown-title">Allocation breakdown</h2>
              <p>Connected balances are based on your account records.</p>
            </div>
            <span>{isLoading ? 'Loading allocation…' : `${allocation.filter((item) => item.connected).length} connected categories`}</span>
          </div>

          <div className="portfolio-allocation-detail-list">
            {allocation.map((item) => (
              <article className={`portfolio-allocation-detail-row${item.connected ? '' : ' is-unavailable'}`} key={item.type}>
                <span aria-hidden="true" className="portfolio-allocation-detail-dot" style={{ backgroundColor: item.color }} />
                <div className="portfolio-allocation-detail-name">
                  <strong>{item.label}</strong>
                  <small>{isLoading ? 'Loading account data' : item.connected ? 'Included in your portfolio' : 'Not connected to GWIC'}</small>
                </div>
                {isLoading ? (
                  <span className="portfolio-allocation-unavailable">Loading…</span>
                ) : item.connected ? (
                  <>
                    <div className="portfolio-allocation-detail-share">
                      <strong>{isLoading ? '—' : `${item.percentage.toFixed(1)}%`}</strong>
                      <span className="portfolio-allocation-progress"><i style={{ width: `${item.percentage}%`, backgroundColor: item.color }} /></span>
                    </div>
                    <strong className="portfolio-allocation-detail-amount">
                      {isLoading ? '—' : formatMoney(item.amount)}
                    </strong>
                  </>
                ) : (
                  <span className="portfolio-allocation-unavailable">Not connected</span>
                )}
              </article>
            ))}
          </div>
          <p className="portfolio-allocation-disclaimer">
            Stocks, Money Market Funds, and T-Bills are shown for completeness, but aren’t included in your total because GWIC does not currently have connected holdings for those asset classes.
          </p>
        </section>

        <Link className="portfolio-allocation-return" to="/portfolio">Return to portfolio overview</Link>
      </main>
    </div>
  );
}

export default PortfolioAllocation;
