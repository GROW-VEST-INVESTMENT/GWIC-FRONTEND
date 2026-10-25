import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import './AccountAccess.css';

const productOptions = [
  {
    value: 'core-lock',
    title: 'Core Lock',
    description: 'Organise savings around a goal and a chosen period.',
  },
  {
    value: 'equity-core',
    title: 'Equity Core',
    description: 'Explore eligible Nigerian and international equities.',
  },
  {
    value: 'undecided',
    title: 'I’m still deciding',
    description: 'Learn about both before choosing.',
  },
];

const savingGoals = [
  'Emergency savings',
  'Rent or housing',
  'Education',
  'Business capital',
  'A major purchase',
  'I’m still exploring',
];

function AccountAccess() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isLogin = location.pathname === '/login';
  const requestedProduct = searchParams.get('product');
  const [selectedProduct, setSelectedProduct] = useState(
    productOptions.some((option) => option.value === requestedProduct) ? requestedProduct : 'undecided',
  );
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);

    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const defaultApiUrl = import.meta.env.PROD
        ? 'https://gwic-backend.onrender.com'
        : 'http://localhost:5000';
      const apiBaseUrl = (import.meta.env.VITE_API_URL || defaultApiUrl).replace(/\/+$/, '');
      const response = await fetch(`${apiBaseUrl}/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'We could not create your account. Please try again.');
      }

      form.reset();
      if (!isLogin) {
        setSelectedProduct('undecided');
      }
      setNotice({
        type: 'success',
        message: isLogin
          ? `Welcome back, ${result.user.name}.`
          : 'Your account has been created successfully. You can now log in.',
      });
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof TypeError
          ? 'Could not reach the server. Please try again in a moment.'
          : error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="access-page">
      <header className="access-header">
        <Link className="access-brand" to="/" aria-label="GWIC home">
          <BrandMark className="access-brand-mark" />
          <span><strong>GWIC</strong><small>GROW WITH CORE</small></span>
        </Link>
        <Link className="access-back" to="/">Back to home</Link>
      </header>

      <main className="access-layout">
        <section className="access-form-column">
          <div className="access-kicker">{isLogin ? 'WELCOME BACK' : 'YOUR FINANCIAL JOURNEY'}</div>
          <h1>{isLogin ? 'Log in to GWIC' : 'Start with a stronger core.'}</h1>
          <p className="access-intro">
            {isLogin
              ? 'Access your GWIC account and continue where you left off.'
              : 'Create your profile, tell us what you’re working toward, and explore the products that may fit your plans.'}
          </p>

          {!isLogin && (
            <ol className="access-steps" aria-label="Signup steps">
              <li className="is-current"><span>01</span>Profile</li>
              <li><span>02</span>Choose</li>
              <li><span>03</span>Review</li>
            </ol>
          )}

          <form className="access-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <label className="field-label" htmlFor="full-name">Full name</label>
                <input className="access-input" autoComplete="name" id="full-name" name="name" placeholder="Your name" required />
              </>
            )}

            <label className="field-label" htmlFor="email">Email address</label>
            <input className="access-input" autoComplete="email" id="email" name="email" placeholder="you@example.com" required type="email" />

            {!isLogin && (
              <>
                <label className="field-label" htmlFor="phone">Phone number <span>(optional)</span></label>
                <input className="access-input" autoComplete="tel" id="phone" name="phone" placeholder="+234 800 000 0000" type="tel" />

                <label className="field-label" htmlFor="goal">What are you planning for?</label>
                <select className="access-input" defaultValue="" id="goal" name="goal" required>
                  <option disabled value="">Choose a goal</option>
                  {savingGoals.map((goal) => <option key={goal} value={goal}>{goal}</option>)}
                </select>

                <fieldset className="product-fieldset">
                  <legend>What would you like to explore first?</legend>
                  <div className="product-options">
                    {productOptions.map((option) => (
                      <label className={`product-choice ${selectedProduct === option.value ? 'is-selected' : ''}`} key={option.value}>
                        <input
                          checked={selectedProduct === option.value}
                          name="product"
                          onChange={() => setSelectedProduct(option.value)}
                          type="radio"
                          value={option.value}
                        />
                        <span className="product-choice-copy">
                          <strong>{option.title}</strong>
                          <small>{option.description}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            <label className="field-label" htmlFor="password">Password</label>
            <input
              className="access-input"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              id="password"
              minLength={8}
              name="password"
              placeholder="At least 8 characters"
              required
              type="password"
            />

            <button className="access-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? (isLogin ? 'Logging in…' : 'Creating account…') : isLogin ? 'Log In' : 'Create account'} <span aria-hidden="true">→</span>
            </button>

            {notice && (
              <p className={`form-status is-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
                {notice.message}
              </p>
            )}
          </form>

          <p className="access-switch">
            {isLogin ? 'New to GWIC?' : 'Already have an account?'}{' '}
            <Link to={isLogin ? '/get-started' : '/login'}>{isLogin ? 'Create an account' : 'Log in'}</Link>
          </p>
        </section>

        <aside className="access-aside">
          <span className="aside-eyebrow">GROW WITH CORE</span>
          <h2>Saving and investing, with more intention.</h2>
          <p>Start by understanding the two proposed product paths. You can review the terms and risks before making any financial decision.</p>

          <div className="aside-product">
            <span className="aside-number">01</span>
            <div><h3>Core Lock</h3><p>Structured savings for goals and chosen time periods.</p></div>
          </div>
          <div className="aside-product">
            <span className="aside-number">02</span>
            <div><h3>Equity Core</h3><p>Explore eligible stock investments and understand market risk.</p></div>
          </div>

          <p className="access-disclaimer">
            Product availability depends on the final partners and operating structure. Investments can lose value; returns and principal are not guaranteed.
          </p>
        </aside>
      </main>
    </div>
  );
}

export default AccountAccess;