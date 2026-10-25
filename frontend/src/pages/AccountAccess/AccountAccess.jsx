import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import './AccountAccess.css';

const PASSWORD_MIN_LENGTH = 8;

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isLogin = location.pathname === '/login';
  const requestedProduct = searchParams.get('product');
  const [selectedProduct, setSelectedProduct] = useState(
    productOptions.some((option) => option.value === requestedProduct) ? requestedProduct : 'undecided',
  );
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const isForgotPassword = location.pathname === '/forgot-password';
  const registrationNotice = isLogin && location.state?.accountCreated
    ? 'Your account is ready. Log in with your new account to continue.'
    : null;

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
        setNotice({
          type: 'error',
          message: result.message || `We could not ${isLogin ? 'log you in' : 'create your account'}. Please try again.`,
          duplicateEmail: !isLogin && response.status === 409,
        });
        return;
      }

      if (!isLogin) {
        navigate('/login', {
          state: {
            accountCreated: true,
            registeredEmail: formData.get('email'),
          },
        });
        return;
      }

      navigate('/dashboard', { replace: true });
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
          <div className="access-kicker">
            {isForgotPassword ? 'ACCOUNT ACCESS' : isLogin ? 'WELCOME BACK' : 'YOUR FINANCIAL JOURNEY'}
          </div>
          <h1>
            {isForgotPassword
              ? 'Password recovery'
              : isLogin
                ? 'Log in to GWIC'
                : 'Start with a stronger core.'}
          </h1>
          <p className="access-intro">
            {isForgotPassword
              ? 'We want to help you get back into your account safely.'
              : isLogin
                ? 'Access your GWIC account and continue where you left off.'
                : 'Create your profile, tell us what you’re working toward, and explore the products that may fit your plans.'}
          </p>

          {isForgotPassword ? (
            <div className="recovery-notice" role="status">
              <span className="recovery-icon" aria-hidden="true">i</span>
              <div>
                <strong>Self-serve password reset isn’t available yet.</strong>
                <p>GWIC can’t send a reset link right now. No changes have been made to your account.</p>
              </div>
              <Link
                className="access-submit recovery-login"
                to="/login"
                state={email ? { registeredEmail: email } : undefined}
              >
                Back to login
              </Link>
            </div>
          ) : !isLogin && (
            <ol className="access-steps" aria-label="Signup steps">
              <li className="is-current"><span>01</span>Profile</li>
              <li><span>02</span>Choose</li>
              <li><span>03</span>Review</li>
            </ol>
          )}

          {!isForgotPassword && <form className="access-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <label className="field-label" htmlFor="full-name">Full name</label>
                <input className="access-input" autoComplete="name" id="full-name" name="name" placeholder="Your name" required />
              </>
            )}

            <label className="field-label" htmlFor="email">Email address</label>
            <input
              className="access-input"
              autoComplete="email"
              defaultValue={isLogin ? email : undefined}
              id="email"
              key={`${location.key}-email`}
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
            />

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

            <div className="password-label-row">
              <label className="field-label" htmlFor="password">Password</label>
              {isLogin && (
                <Link
                  className="forgot-password-link"
                  to="/forgot-password"
                  state={email ? { registeredEmail: email } : undefined}
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="password-input-wrap">
              <input
                className="access-input"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                autoFocus={isLogin && Boolean(location.state?.accountCreated)}
                id="password"
                minLength={PASSWORD_MIN_LENGTH}
                name="password"
                placeholder={isLogin ? 'Enter your password' : `At least ${PASSWORD_MIN_LENGTH} characters`}
                required
                type={showPassword ? 'text' : 'password'}
                aria-describedby={!isLogin ? 'password-requirement' : undefined}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="password-visibility"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {!isLogin && (
              <p className="password-requirement" id="password-requirement">
                Use at least {PASSWORD_MIN_LENGTH} characters.
              </p>
            )}

            <button aria-busy={isSubmitting} className="access-submit" disabled={isSubmitting} type="submit">
              {isSubmitting && <span aria-hidden="true" className="access-spinner" />}
              <span>{isSubmitting ? (isLogin ? 'Logging in…' : 'Creating account…') : isLogin ? 'Log In' : 'Create account'}</span>
              {!isSubmitting && <span aria-hidden="true">→</span>}
            </button>

            {(registrationNotice || notice) && (
              <p className={`form-status is-${notice?.type || 'success'}`} role={notice?.type === 'error' ? 'alert' : 'status'}>
                {notice?.message || registrationNotice}
                {notice?.duplicateEmail && (
                  <>
                    {' '}
                    <Link
                      className="status-action"
                      to="/login"
                      state={{ registeredEmail: email.trim() }}
                    >
                      Go to login
                    </Link>
                  </>
                )}
              </p>
            )}
          </form>}

          <p className="access-switch">
            {isForgotPassword
              ? 'Remember your password?'
              : isLogin
                ? 'New to GWIC?'
                : 'Already have an account?'}{' '}
            <Link to={isForgotPassword || !isLogin ? '/login' : '/get-started'}>
              {isForgotPassword ? 'Log in' : isLogin ? 'Create an account' : 'Log in'}
            </Link>
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