import './LandingPage.css';
import { Link } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';

const benefits = [
  { icon: 'shield', title: 'Plan with purpose', text: 'Set goals around the things that matter to you.' },
  { icon: 'chart', title: 'Understand the options', text: 'Review product details, access terms, and risks before you decide.' },
  { icon: 'bolt', title: 'Know what’s available', text: 'See product status clearly before taking your next step.' },
];

const products = [
  {
    slug: 'core-lock',
    icon: 'coins',
    title: 'Core Lock',
    subtitle: 'Structured savings for a chosen term',
    text: 'Core Lock is not available yet. We’re preparing the product and its operating controls before customers can start a plan.',
  },
  {
    slug: 'equity-core',
    icon: 'chart',
    title: 'Equity Core',
    subtitle: 'A planned stock-investing product',
    text: 'Equity Core is not available yet. Stock investing involves risk, and product access and terms will be shared before launch.',
  },
];

const exampleGoals = ['Emergency fund', 'Rent or housing', 'Education', 'Business capital'];

function FeatureIcon({ name }) {
  if (name === 'shield') {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 27 7v8c0 7-4.7 11.7-11 14C9.7 26.7 5 22 5 15V7l11-4Z" fill="none" stroke="currentColor" strokeWidth="3" /><path d="m11 16 3.5 3.5 7-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  if (name === 'bolt') {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M18 2 7 18h8l-1 12 12-18h-9l1-10Z" fill="currentColor" /></svg>;
  }
  if (name === 'coins') {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="14" cy="8" rx="9" ry="4" fill="currentColor" /><path d="M5 8v5c0 2.2 4 4 9 4 2.4 0 4.6-.4 6.3-1.1V11c-1.7.7-3.9 1-6.3 1-5 0-9-1.8-9-4Zm0 9v5c0 2.2 4 4 9 4 2.1 0 4-.3 5.5-.9v-5c-1.5.6-3.4.9-5.5.9-5 0-9-1.8-9-4Z" fill="currentColor" /><circle cx="23" cy="21" r="7" fill="#a8ed43" /><path d="M23 17v8m-2-6h3.2a1.5 1.5 0 0 1 0 3H22" fill="none" stroke="#07543d" strokeWidth="1.5" strokeLinecap="round" /></svg>;
  }
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 25V7m0 18h25M8 21l7-7 5 4 8-10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 8h6v6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 25v-5h4v5m4 0v-8h4v8m4 0v-11h4v11" fill="currentColor" /></svg>;
}

function DashboardPreview() {
  return (
    <div className="dashboard-scene" aria-label="Kalma Capital account dashboard preview">
      <span className="scene-leaf scene-leaf-left animate-[foliage-sway_5.4s_ease-in-out_infinite]" aria-hidden="true" />
      <span className="scene-leaf scene-leaf-right animate-[foliage-sway_5.4s_ease-in-out_infinite]" aria-hidden="true" />
      <span className="scene-leaf scene-leaf-back animate-[foliage-sway_5.4s_ease-in-out_infinite]" aria-hidden="true" />
      <div className="dashboard-device">
        <div className="dashboard-card">
          <div className="dashboard-status">
            <span>9:41</span>
            <svg viewBox="0 0 48 14" aria-hidden="true">
              <path d="M2 12V8m6 4V5m6 7V2m9 1c4 0 7 3 7 7m-11-4a6 6 0 0 1 8 0m-6 3a2 2 0 0 1 3 0m7 3h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H30a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2Zm14-5v2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="dashboard-brand">
            <BrandMark />
            <div><strong>KALMA CAPITAL</strong><small>Powered by GWIC</small></div>
          </div>
          <div className="balance-label">Example wallet balance</div>
          <div className="balance-amount">₦750,432.50</div>
          <div className="balance-change"><span>Illustrative preview</span><small>Not actual performance</small></div>
          <svg className="balance-chart" viewBox="0 0 420 150" role="img" aria-label="Illustrative balance chart, not actual account performance">
            <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#75e742" stopOpacity=".35" /><stop offset="1" stopColor="#75e742" stopOpacity="0" /></linearGradient></defs>
            <path d="M0 128 48 115 84 119 126 94 158 101 204 68 235 76 282 48 315 57 361 23 420 8v142H0Z" fill="url(#chartFill)" />
            <path d="M0 128 48 115 84 119 126 94 158 101 204 68 235 76 282 48 315 57 361 23 420 8" fill="none" stroke="#78eb43" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle className="chart-endpoint-pulse" cx="414" cy="9" r="8" fill="none" stroke="#adff70" strokeWidth="2" />
            <circle cx="414" cy="9" r="4" fill="#adff70" />
          </svg>
          <div className="dashboard-actions">
            <div>
              <svg className="dashboard-action-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 13h18v14H7zM10 13V9h12v4m-6 6v3m-3-8 3-5 3 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /></svg>
              <strong>Savings</strong><small>Core Lock</small>
            </div>
            <div>
              <svg className="dashboard-action-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 26h23M8 23v-6h5v6m3 0V11h5v12m3 0V6h4v17M7 12l7-5 5 3 8-7m-6 0h6v6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <strong>Investments</strong><small>Equity Core</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-landscape" aria-hidden="true"><span className="stone stone-back" /><span className="stone stone-front" /><span className="leaf leaf-one" /><span className="leaf leaf-two" /><span className="leaf leaf-three" /></div>
        <div className="hero-inner">
          <header className="site-header">
            <a className="brand" href="#top" aria-label="Kalma Capital home">
              <BrandMark />
              <span className="brand-copy"><strong>KALMA CAPITAL</strong><small>Powered by GWIC</small></span>
            </a>
            <nav className="top-nav" aria-label="Main navigation">
              <a href="#core-lock">Save</a><span>·</span><a href="#equity-core">Invest</a><span>·</span><a href="#benefits">Grow</a>
            </nav>
          </header>

          <main id="top">
            <section className="hero-content">
              <div className="hero-copy">
                <h1>Your Goals.<br />Our Core.<br /><span>Plan with purpose.</span></h1>
                <p>Set savings goals, manage wallet activity, and explore upcoming savings and investing products. Product access depends on availability and final terms.</p>
                <div className="usage-guide flex w-fit flex-wrap items-center gap-[clamp(3px,1vw,13px)]" aria-label="How Kalma Capital works">
                  <span className="guide-step inline-flex items-center gap-[7px] animate-[guide-step_8.4s_ease-in-out_infinite]"><b>01</b> Set a goal</span>
                  <span className="guide-arrow" aria-hidden="true">→</span>
                  <span className="guide-step inline-flex items-center gap-[7px] [animation-delay:2.8s] animate-[guide-step_8.4s_ease-in-out_infinite]"><b>02</b> Review options</span>
                  <span className="guide-arrow" aria-hidden="true">→</span>
                  <span className="guide-step inline-flex items-center gap-[7px] [animation-delay:5.6s] animate-[guide-step_8.4s_ease-in-out_infinite]"><b>03</b> Track progress</span>
                </div>
              </div>
              <DashboardPreview />
            </section>
          </main>
        </div>
        <div className="hero-edge" aria-hidden="true" />
      </section>

      <section className="content-section">
        <div className="content-inner">
          <section className="benefits-grid" id="benefits" aria-label="Benefits">
            {benefits.map((benefit) => (
              <article className="benefit" key={benefit.title}>
                <div className="benefit-icon"><FeatureIcon name={benefit.icon} /></div>
                <h2>{benefit.title}</h2>
                <p>{benefit.text}</p>
              </article>
            ))}
          </section>

          <section className="feature-grid" aria-label="Kalma Capital products">
            {products.map((product) => (
              <article className="feature-card" id={product.title === 'Core Lock' ? 'core-lock' : 'equity-core'} key={product.title}>
                <div className="feature-icon"><FeatureIcon name={product.icon} /></div>
                <h2>{product.title}</h2>
                <p className="feature-subtitle">{product.subtitle}</p>
                <p className="feature-body">{product.text}</p>
                <Link className="feature-arrow" to={`/get-started?product=${product.slug}`} aria-label={`Explore ${product.title}`}>→</Link>
              </article>
            ))}
          </section>

          <section className="goal-section" aria-labelledby="goal-section-title">
            <div className="goal-copy">
              <span>START WITH WHAT MATTERS</span>
              <h2 id="goal-section-title">Give your next goal a clearer direction.</h2>
              <p>Savings and investing serve different needs. Start by considering your goal, timeframe, access needs, and comfort with risk.</p>
            </div>
            <ul className="goal-list" aria-label="Example financial goals">
              {exampleGoals.map((goal) => <li key={goal}>{goal}</li>)}
            </ul>
          </section>

          <section className="cta-section" aria-label="Get started">
            <Link className="primary-cta" to="/get-started">Get Started <span>→</span></Link>
            <Link className="secondary-cta" to="/login">Log In</Link>
          </section>

        </div>
      </section>

      <section className="faq-section" id="faq" aria-labelledby="faq-title">
        <div className="faq-intro">
          <span className="faq-eyebrow">A CLEARER START</span>
          <h2 id="faq-title">Before you choose</h2>
          <p>Understand the product, the terms, and the risks before making a financial decision.</p>
        </div>
        <div className="faq-list">
          <details>
            <summary>What can I use on Kalma Capital today?</summary>
            <p>You can create an account, set savings goals, and manage wallet activity. Core Lock plans and Equity Core stock investing are not currently available. We’ll share their terms and availability before they launch.</p>
          </details>
          <details>
            <summary>What should I know about Equity Core?</summary>
            <p>Equity Core is a planned stock-investing product and is not currently available. If launched, stock values can rise or fall and you may lose money. Product access and terms will be shared before launch.</p>
          </details>
          <details>
            <summary>Are returns or principal guaranteed?</summary>
            <p>No. Returns, liquidity, fees, and risk depend on the specific financial product. Review the final terms and disclosures before investing or committing funds. The figures in the dashboard preview are illustrative, not a promise or actual customer result.</p>
          </details>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="footer-brand-block">
            <Link className="footer-brand" to="/" aria-label="Kalma Capital home">
              <BrandMark />
              <span><strong>KALMA CAPITAL</strong><small>Powered by GWIC · Grow with Core</small></span>
            </Link>
            <p>Set financial goals, manage wallet activity, and learn about products as they become available.</p>
            <p className="footer-contact">Need help? <a href="mailto:support@kalmacapital.com">support@kalmacapital.com</a></p>
          </div>
          <nav className="footer-nav" aria-label="Explore Kalma Capital">
            <strong>Explore</strong>
            <a href="#benefits">Why Kalma Capital</a>
            <a href="#core-lock">Core Lock</a>
            <a href="#equity-core">Equity Core</a>
          </nav>
          <nav className="footer-nav" aria-label="Your account">
            <strong>Your account</strong>
            <Link to="/get-started">Get started</Link>
            <Link to="/login">Log in</Link>
          </nav>
          <p className="footer-disclaimer">
            Product availability, fees, withdrawal terms, and investment risks depend on the final products and partners. Investment values can go down as well as up.
          </p>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} KALMA CAPITAL</span>
            <span>Powered by GWIC · Grow with Core</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;