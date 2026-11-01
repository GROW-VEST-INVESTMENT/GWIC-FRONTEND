import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import { readApiResponse } from '../../utils/readApiResponse';
import { Icon } from './InvestShared';
import stocks, { navigation } from './investStocks';
import './Invest.css';

const filters = ['All Stocks', 'NGX', 'US Stocks', 'Foreign Equities', 'ETFs'];

function formatMoney(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function Invest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [wallet, setWallet] = useState(null);
  const [coreProducts, setCoreProducts] = useState(null);
  const [query, setQuery] = useState(location.state?.investList?.query || '');
  const [activeFilter, setActiveFilter] = useState(location.state?.investList?.activeFilter || 'All Stocks');
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState('');
  const [coreSavingsError, setCoreSavingsError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadInvestData() {
      setIsLoadingWallet(true);
      setWallet(null);
      setCoreProducts(null);
      setWalletError('');
      setCoreSavingsError('');
      const responses = await Promise.allSettled([
        fetch('/api/wallet', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        }),
        fetch('/api/core-savings', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        }),
      ]);
      if (controller.signal.aborted) return;

      const unauthorized = responses.some(
        (result) => result.status === 'fulfilled' && result.value.status === 401,
      );
      if (unauthorized) {
        navigate('/login', { replace: true });
        return;
      }

      const [walletResponse, savingsResponse] = responses;
      if (walletResponse.status === 'fulfilled') {
        try {
          const walletData = await readApiResponse(walletResponse.value, 'We could not load your wallet balance.');
          if (!Number.isFinite(walletData.balance)) {
            throw new Error('GWIC returned an invalid wallet balance.');
          }
          setWallet(walletData);
        } catch (requestError) {
          setWalletError(requestError instanceof TypeError
            ? 'We could not reach GWIC. Check your connection and try again.'
            : requestError.message);
        }
      } else {
        setWalletError(walletResponse.reason instanceof TypeError
          ? 'We could not reach GWIC. Check your connection and try again.'
          : walletResponse.reason.message);
      }

      if (savingsResponse.status === 'fulfilled') {
        try {
          const savings = await readApiResponse(savingsResponse.value, 'We could not load Core plan availability.');
          if (!Array.isArray(savings.products)) {
            throw new Error('GWIC returned invalid Core plan availability.');
          }
          setCoreProducts(savings.products);
        } catch (requestError) {
          setCoreSavingsError(requestError instanceof TypeError
            ? 'Core plan availability could not be checked.'
            : requestError.message);
        }
      } else {
        setCoreSavingsError(savingsResponse.reason instanceof TypeError
          ? 'Core plan availability could not be checked.'
          : savingsResponse.reason.message);
      }

      if (!controller.signal.aborted) setIsLoadingWallet(false);
    }

    loadInvestData();
    return () => controller.abort();
  }, [navigate, retryCount]);

  const visibleStocks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return stocks.filter((stock) => {
      const matchesFilter = activeFilter === 'All Stocks'
        || (activeFilter === 'NGX' && stock.exchange === 'NGX')
        || (activeFilter === 'US Stocks' && stock.region === 'United States')
        || (activeFilter === 'Foreign Equities' && stock.region !== 'Nigeria')
        || activeFilter === 'ETFs' && stock.type === 'ETF';
      const matchesQuery = !normalizedQuery
        || `${stock.name} ${stock.ticker} ${stock.exchange} ${stock.region}`.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  return (
    <div className="invest-page">
      <header className="invest-header">
        <Link aria-label="Back to dashboard" className="invest-back" to="/dashboard"><Icon name="back" /></Link>
        <Link aria-label="GWIC home" className="invest-brand" to="/dashboard">
          <span className="invest-brand-mark"><BrandMark /></span>
          <span><strong>GWIC</strong><small>GrowWithCore</small></span>
        </Link>
        <Link aria-label="Notifications" className="invest-notifications" to="/activity">
          <Icon name="bell" />
        </Link>
        <Link aria-label="Account profile" className="invest-profile" to="/more"><Icon name="user" /></Link>
      </header>

      <main className="invest-main">
        <section className="invest-hero">
          <div className="invest-hero-copy">
            <h1>Buy Stocks</h1>
            <p>Invest in top companies. Build your wealth, one stock at a time.</p>
            <div className="invest-benefits" aria-label="Stock market information">
              <span><Icon name="chart" /><span>Company<br />listings</span></span>
              <span><Icon name="shield" /><span>Trading<br />not live</span></span>
              <span><Icon name="globe" /><span>Local &amp; global<br />markets</span></span>
            </div>
          </div>
          <div aria-hidden="true" className="invest-hero-art">
            <img alt="" src="/invest-hero-art.png" />
          </div>
        </section>

        <div className="invest-content-surface">
          <section aria-label="Available wallet balance" className="invest-balance-card">
            <div className="invest-balance-details">
              <span>Available Balance <Icon name="eye" /></span>
              <strong>{isLoadingWallet ? 'Loading…' : wallet ? formatMoney(wallet.balance) : 'Unavailable'}</strong>
              <small className="invest-balance-market-note"><Icon name="chart" /><span>Market performance unavailable</span></small>
            </div>
            <div className="invest-balance-actions">
              <Link
                aria-label="Add money to your wallet"
                className="invest-button is-primary"
                state={{ openWalletAction: 'deposit' }}
                to="/dashboard#account-balances"
              >
                <Icon name="plus" />Add money
              </Link>
            </div>
          </section>

          {walletError && (
            <div className="invest-error" role="alert">
              <p>{walletError}</p>
              <button onClick={() => setRetryCount((count) => count + 1)} type="button">Try again</button>
            </div>
          )}

          <div className="invest-search-row">
            <label className="invest-search">
              <Icon name="search" />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search stocks, tickers or companies..."
                type="search"
                value={query}
              />
            </label>
            <button
              aria-label="Reset stock filters"
              className="invest-search-filter"
              onClick={() => { setActiveFilter('All Stocks'); setQuery(''); }}
              title="Reset stock filters"
              type="button"
            >
              <Icon name="sliders" />
            </button>
          </div>

          <div aria-label="Filter stocks" className="invest-filters" role="group">
            {filters.map((filter) => (
              <button
                aria-pressed={activeFilter === filter}
                className={activeFilter === filter ? 'is-active' : ''}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>

          <section aria-labelledby="invest-stocks-heading" className="invest-products">
            <div className="invest-section-heading">
              <h2 id="invest-stocks-heading">{activeFilter === 'All Stocks' ? 'Popular Stocks' : activeFilter}</h2>
            </div>

            {visibleStocks.length ? (
              <div className="invest-product-list">
                {visibleStocks.map((stock) => (
                  <Link
                    className="invest-product-card"
                    key={stock.ticker}
                    state={{ investList: { activeFilter, query } }}
                    to={`/invest/${stock.ticker}`}
                  >
                    <span aria-hidden="true" className={`invest-stock-mark is-${stock.color}`}>{stock.mark}</span>
                    <div className="invest-stock-description">
                      <h3>{stock.name}</h3>
                      <p>{stock.ticker}<span>·</span>{stock.exchange}</p>
                    </div>
                    <div className="invest-stock-quote">
                      <strong>—</strong>
                      <small>Quote unavailable</small>
                    </div>
                    <span aria-label="Market chart unavailable" className="invest-stock-sparkline">
                      <svg aria-hidden="true" viewBox="0 0 100 32" preserveAspectRatio="none">
                        <path d="M2 16H98" />
                      </svg>
                    </span>
                    <span aria-label={`View ${stock.name} details`} className="invest-stock-details-action">Details</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="invest-empty">
                <span className="invest-empty-mark"><Icon name="search" /></span>
                <h3>No matching stocks</h3>
                <p>Try a different search or stock category.</p>
                <button onClick={() => { setQuery(''); setActiveFilter('All Stocks'); }} type="button">Clear filters</button>
              </div>
            )}
          </section>

          <Link className="invest-availability-note" to="/core-lock">
            <span className="invest-availability-icon"><Icon name="invest" /></span>
            <span className="invest-availability-copy">
              <strong>New to investing?</strong>
              <small>
                {coreProducts
                  ? coreProducts.some((product) => product.available)
                    ? 'Learn the basics and explore available GWIC Core plans.'
                    : 'Learn the basics and see GWIC Core plans while investments are unavailable.'
                  : coreSavingsError || 'Learn the basics and start your journey with GWIC.'}
              </small>
            </span>
            <span className="invest-learn-more">Learn More <Icon name="arrow" /></span>
          </Link>
        </div>
      </main>

      <nav aria-label="Mobile account navigation" className="invest-mobile-nav">
        {navigation.map((item) => (
          <Link aria-current={item.label === 'Invest' ? 'page' : undefined} key={item.label} to={item.path}>
            <Icon name={item.icon} /><span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Invest;
