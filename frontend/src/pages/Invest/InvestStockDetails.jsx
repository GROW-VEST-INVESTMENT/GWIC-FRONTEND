import { Link, useLocation, useParams } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import { Icon } from './InvestShared';
import stocks, { navigation } from './investStocks';
import './Invest.css';

function InvestStockDetails() {
  const { ticker = '' } = useParams();
  const location = useLocation();
  const stock = stocks.find((item) => item.ticker.toLowerCase() === ticker.toLowerCase());
  const listState = location.state?.investList;

  return (
    <div className="invest-page">
      <header className="invest-header invest-detail-header">
        <Link
          aria-label="Back to stocks"
          className="invest-back"
          state={{ investList: listState }}
          to="/invest"
        >
          <svg aria-hidden="true" className="invest-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6M9 12h12" />
          </svg>
        </Link>
        <Link aria-label="GWIC home" className="invest-brand" to="/dashboard">
          <span className="invest-brand-mark"><BrandMark /></span>
          <span><strong>GWIC</strong><small>GrowWithCore</small></span>
        </Link>
      </header>

      <main className="invest-main invest-stock-detail-main">
        {stock ? (
          <div className="invest-stock-detail-card">
            <Link className="invest-detail-back-link" state={{ investList: listState }} to="/invest">
              <span aria-hidden="true">←</span> Back to stocks
            </Link>

            <section aria-labelledby="invest-detail-title" className="invest-detail-company">
              <span aria-hidden="true" className={`invest-stock-mark is-${stock.color}`}>{stock.mark}</span>
              <div>
                <p className="invest-detail-eyebrow">{stock.ticker} <span>·</span> {stock.exchange}</p>
                <h1 id="invest-detail-title">{stock.name}</h1>
                <p className="invest-detail-region">{stock.region}</p>
              </div>
            </section>

            <section aria-labelledby="invest-detail-market-title" className="invest-detail-market">
              <span aria-hidden="true" className="invest-detail-market-icon">↗</span>
              <div>
                <h2 id="invest-detail-market-title">Market data isn’t connected yet</h2>
                <p>Live price, price history, and market performance will appear here when a market-data provider is connected.</p>
              </div>
              <span className="invest-detail-status">Unavailable</span>
            </section>

            <section aria-labelledby="invest-detail-about-title" className="invest-detail-section">
              <h2 id="invest-detail-about-title">Company overview</h2>
              <p>{stock.overview}</p>
            </section>

            <section aria-labelledby="invest-detail-info-title" className="invest-detail-section">
              <h2 id="invest-detail-info-title">Listing information</h2>
              <dl className="invest-detail-facts">
                <div><dt>Exchange</dt><dd>{stock.exchange}</dd></div>
                <div><dt>Market</dt><dd>{stock.region}</dd></div>
                <div><dt>Sector</dt><dd>{stock.sector}</dd></div>
                <div><dt>Quote currency</dt><dd>{stock.currency}</dd></div>
                <div><dt>Instrument</dt><dd>Equity</dd></div>
              </dl>
            </section>

            <section className="invest-detail-trading" aria-label="Trading availability">
              <button disabled type="button">Trading not available yet</button>
              <p>GWIC has not connected a broker or order-execution service. You can review this listing, but you can’t place a trade yet.</p>
            </section>

            <p className="invest-detail-disclaimer">
              Company information is for identification only and is not an investment recommendation. Prices and performance are not currently available.
            </p>
          </div>
        ) : (
          <section aria-labelledby="invest-detail-missing-title" className="invest-detail-missing">
            <h1 id="invest-detail-missing-title">Stock not found</h1>
            <p>This listing isn’t available in the GWIC stock catalogue.</p>
            <Link className="invest-detail-primary-link" state={{ investList: listState }} to="/invest">Browse stocks</Link>
          </section>
        )}
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

export default InvestStockDetails;
