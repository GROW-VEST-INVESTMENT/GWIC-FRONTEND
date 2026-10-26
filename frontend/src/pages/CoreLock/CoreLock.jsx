import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CoreLock.css';

const lockSteps = [
  { icon: 'shield', title: '1. Choose a term', description: 'Compare the available lock periods.' },
  { icon: 'coins', title: '2. Review terms', description: 'Check the rate, fees and lock rules.' },
  { icon: 'lock', title: '3. Confirm details', description: 'Review your amount before starting.' },
  { icon: 'bolt', title: '4. Track your lock', description: 'Follow its progress and maturity.' },
];

function Icon({ name, className = '' }) {
  const paths = {
    arrowLeft: <path d="m15 18-6-6 6-6M9 12h12" />,
    arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
    invest: <><path d="M3 20h18M5 17v-5h3v5m3 0V9h3v8m3 0V5h3v12" /><path d="m5 9 5-4 4 2 6-5m-5 0h5v5" /></>,
    portfolio: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M8 16h2l2-3 2 2 3-4m-3 0h3v3" /></>,
    more: <path d="M3 6h18M3 12h18M3 18h18" />,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    coins: <><ellipse cx="10" cy="6" rx="6" ry="3" /><path d="M4 6v4c0 1.7 2.7 3 6 3s6-1.3 6-3V6M4 10v4c0 1.7 2.7 3 6 3m0-4c3.3 0 6-1.3 6-3m-6 7v1c0 1.7 2.7 3 6 3s6-1.3 6-3v-4m-6 0v4c0 1.7 2.7 3 6 3m-6-3c0-1.7 2.7-3 6-3s6 1.3 6 3" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18m-9 3v3m-1.5-1.5h3" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    homeGoal: <><path d="m2.5 11 9.5-8 9.5 8h-2v9h-5v-5h-5v5h-5v-9h-2Z" fill="currentColor" stroke="none" /><path d="M12 12v5m-2.5-2.5h5" stroke="#087849" strokeWidth="1.8" /></>,
    car: <><path d="m4 11 2-5h12l2 5 2 2v5h-2v-2H4v2H2v-5l2-2Z" /><path d="M4 11h16M6 14h.01M18 14h.01" /></>,
    education: <><path d="m2 9 10-5 10 5-10 5L2 9Z" /><path d="M6 11v5c4 3 8 3 12 0v-5m5-2v7" /></>,
    savings: <><path d="M4 10h13a3 3 0 0 1 3 3v4H7a4 4 0 0 1-4-4v-1a2 2 0 0 1 1-2Z" /><path d="M6 10V7h8l3 3m-9 7h1m7-7v-3h3l2 3" /></>,
  };

  return (
    <svg aria-hidden="true" className={`core-lock-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function BrandMark() {
  return (
    <svg aria-hidden="true" className="core-lock-brand-mark" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="27" fill="currentColor" />
      <path d="M12 41V29l8-7 6 6 12-14 6 5-17 20-7-6-3 3v5h-5Z" fill="#075334" />
      <path d="M17 42h5V33l-5 5v4Zm9 0h5V28l-5 6v8Zm9 0h5V21l-5 6v15Z" fill="#075334" />
      <path d="m34 14 6-6 6 6" fill="none" stroke="#075334" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VaultIllustration() {
  return <img alt="" className="core-lock-vault-art" src="/core-lock-vault.jpg" />;
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function getGoalIcon(name) {
  const normalizedName = name.toLowerCase();
  if (/(car|vehicle|transport)/.test(normalizedName)) return 'car';
  if (/(education|school|tuition|study)/.test(normalizedName)) return 'education';
  if (/(emergency|home|house|family)/.test(normalizedName)) return 'homeGoal';
  return 'savings';
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function CoreLock() {
  const navigate = useNavigate();
  const [coreLock, setCoreLock] = useState(null);
  const [savings, setSavings] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [productType, setProductType] = useState('CORE_TARGET');
  const [lockPeriodDays, setLockPeriodDays] = useState(30);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [liquidatingPlanId, setLiquidatingPlanId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const selectedProduct = useMemo(
    () => savings?.products.find((product) => product.productType === productType),
    [productType, savings],
  );
  const availableTerms = useMemo(() => {
    if (productType === 'CORE_TARGET') return [30, 60];
    return [90, 180, 365];
  }, [productType]);
  const estimatedYield = useMemo(() => {
    const principal = Number(amount);
    if (!Number.isSafeInteger(principal) || principal < 1 || !selectedProduct) return null;
    return principal * (selectedProduct.annualYieldPercent / 100) * lockPeriodDays / 365;
  }, [amount, lockPeriodDays, selectedProduct]);

  const loadCoreData = useCallback(async () => {
    const responses = await Promise.all([
      fetch('/api/core-lock', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      }),
      fetch('/api/core-savings', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      }),
      fetch('/api/wallet', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      }),
    ]);
    if (responses.some((response) => response.status === 401)) {
      navigate('/login', { replace: true });
      return false;
    }
    if (responses.some((response) => !response.ok)) {
      const failedResponse = responses.find((response) => !response.ok);
      const result = await failedResponse.json().catch(() => null);
      throw new Error(result?.message || 'We could not load Core savings. Please try again.');
    }

    const [coreLockData, savingsData, walletData] = await Promise.all(
      responses.map((response) => response.json()),
    );
    setCoreLock(coreLockData);
    setSavings(savingsData);
    setWallet(walletData);
    setError('');
    return true;
  }, [navigate]);

  useEffect(() => {
    let isActive = true;

    async function loadCoreLockData() {
      try {
        await loadCoreData();
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

    loadCoreLockData();
    return () => {
      isActive = false;
    };
  }, [loadCoreData, retryKey]);

  async function handleCreatePlan(event) {
    event.preventDefault();
    setError('');
    setActionMessage('');
    setIsSubmittingPlan(true);
    try {
      const response = await fetch('/api/core-savings/plans', {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType,
          amount: Number(amount),
          lockPeriodDays,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const result = await response.json().catch(() => null);
      if (response.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      if (!response.ok) throw new Error(result?.message || 'We could not start this savings plan.');
      setAmount('');
      setActionMessage('Your Core savings plan has been started.');
      await loadCoreData();
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'We could not reach GWIC. Check your connection and try again.'
        : requestError.message);
    } finally {
      setIsSubmittingPlan(false);
    }
  }

  async function handleEarlyLiquidation(event, plan) {
    event.preventDefault();
    setError('');
    setActionMessage('');
    const confirmed = window.confirm(
      `Early liquidation forfeits all accrued yield and deducts the greater of 3.5% of principal or accrued yield (${formatMoney(plan.accruedYield, 'NGN')}) from principal. Only the remaining principal is returned to your wallet. Continue?`,
    );
    if (!confirmed) return;

    setLiquidatingPlanId(plan.id);
    try {
      const response = await fetch(`/api/core-savings/plans/${encodeURIComponent(plan.id)}/liquidate`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const result = await response.json().catch(() => null);
      if (response.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      if (!response.ok) throw new Error(result?.message || 'We could not liquidate this plan.');
      setPassword('');
      setActionMessage(
        `Early liquidation complete. ${formatMoney(result.returnedToWallet, 'NGN')} returned to your wallet; ${formatMoney(result.penalty, 'NGN')} penalty applied.`,
      );
      await loadCoreData();
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'We could not reach GWIC. Check your connection and try again.'
        : requestError.message);
    } finally {
      setLiquidatingPlanId('');
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Logout could not be confirmed.');
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return <div className="core-lock-loading">Loading your Core Lock…</div>;
  }

  if (!coreLock) {
    return (
      <div className="core-lock-loading" role="alert">
        <p>{error || 'Core Lock is unavailable right now.'}</p>
        <button className="core-lock-primary is-compact" onClick={() => { setIsLoading(true); setRetryKey((key) => key + 1); }} type="button">Try again</button>
      </div>
    );
  }

  const currency = coreLock.currency;
  const goals = coreLock.activeGoals;
  const userName = coreLock.user.name;
  const initials = userName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const plans = savings.plans || [];
  const activePlans = plans.filter((plan) => plan.status === 'ACTIVE');
  const activeSavingsBalance = activePlans.reduce(
    (total, plan) => total + plan.principalAmount + plan.accruedYield,
    0,
  );
  const coreFlex = savings.products.find((product) => product.productType === 'CORE_FLEX');

  return (
    <div className="core-lock-page">
      <header className="core-lock-header">
        <Link aria-label="Back to dashboard" className="core-lock-back" to="/dashboard"><Icon name="arrowLeft" /></Link>
        <Link aria-label="GWIC home" className="core-lock-brand" to="/dashboard">
          <BrandMark />
          <span><strong>GWIC</strong><small>GrowWithCore</small></span>
        </Link>
        <nav className="core-lock-desktop-nav" aria-label="Account navigation">
          <Link to="/dashboard"><Icon name="home" /> Home</Link>
          <span className="is-current"><Icon name="lock" /> Core Lock</span>
          <Link to="/dashboard"><Icon name="invest" /> Invest</Link>
          <Link to="/dashboard"><Icon name="portfolio" /> Portfolio</Link>
        </nav>
        <div className="core-lock-profile">
          <button aria-label="Notifications are not available yet" className="core-lock-notifications" disabled type="button"><Icon name="bell" /></button>
          <span aria-label={`Signed in as ${userName}`} className="core-lock-avatar">{initials}</span>
          <button className="core-lock-signout" disabled={isLoggingOut} onClick={handleLogout} type="button">{isLoggingOut ? 'Signing out…' : 'Sign out'}</button>
        </div>
      </header>

      <main className="core-lock-content">
        <section className="core-lock-hero">
          <div className="core-lock-hero-copy">
            <h1>Core Lock</h1>
            <h2>Save with a defined term and rate</h2>
            <p>Compare Core Target and Core Lock, review the maturity date, and track your active plans.</p>
          </div>
          <VaultIllustration />
        </section>

        <section aria-label="Core savings balance" className="core-lock-balance">
          <div className="core-lock-balance-icon"><Icon name="coins" /></div>
          <div className="core-lock-balance-copy">
            <span>Active Core Savings <Icon name="eye" /></span>
            <strong>{formatMoney(activeSavingsBalance, currency)}</strong>
            <small>Principal plus yield recorded so far across active plans.</small>
          </div>
          <span className="core-lock-status"><i /> {activePlans.length} active {activePlans.length === 1 ? 'plan' : 'plans'}</span>
        </section>

        <section aria-label="Core Lock availability" className="core-lock-availability">
          <strong>Core Flex is unavailable for now</strong>
          <p>{coreFlex?.availabilityMessage || 'Instant withdrawals are disabled until a documented liquidity reserve or facility is in place.'} Your wallet balance is separate from locked Core savings.</p>
        </section>

        {error && <p className="core-lock-error" role="alert">{error}</p>}
        {actionMessage && <p className="core-lock-success" role="status">{actionMessage}</p>}

        <section className="core-lock-period-section" aria-labelledby="lock-period-heading">
          <div className="core-lock-section-heading">
            <h2 id="lock-period-heading">Choose a Core Savings plan</h2>
            <span>Rates are annual; yield accrues daily.</span>
          </div>
          <div className="core-lock-products">
            {savings.products.map((product) => (
              <button
                aria-pressed={productType === product.productType}
                className={`core-lock-product${productType === product.productType ? ' is-selected' : ''}`}
                disabled={product.productType === 'CORE_FLEX'}
                key={product.productType}
                onClick={() => {
                  setProductType(product.productType);
                  setLockPeriodDays(product.productType === 'CORE_TARGET' ? 30 : 90);
                }}
                type="button"
              >
                <span className="core-lock-product-top">
                  <Icon className="core-lock-calendar" name={product.productType === 'CORE_FLEX' ? 'bolt' : 'calendar'} />
                  <span className={`core-lock-period-status${product.available ? ' is-available' : ''}`}>
                    {product.available ? 'Available' : product.productType === 'CORE_FLEX' ? 'Unavailable' : 'Setup pending'}
                  </span>
                </span>
                <strong>{product.productType === 'CORE_FLEX' ? 'Core Flex' : product.productType === 'CORE_TARGET' ? 'Core Target' : 'Core Lock'}</strong>
                <span className="core-lock-product-rate">{product.annualYieldPercent}% p.a.</span>
                <span className="core-lock-product-description">
                  {product.productType === 'CORE_FLEX'
                    ? 'Daily access · instant withdrawal'
                    : `${product.minimumDays}–${product.maximumDays} day term`}
                </span>
              </button>
            ))}
          </div>
        </section>

        <form className="core-lock-invest-form" onSubmit={handleCreatePlan}>
          <div className="core-lock-section-heading">
            <h2>Start a plan</h2>
            <span>Available wallet: {formatMoney(wallet.balance, currency)}</span>
          </div>
          <div className="core-lock-form-grid">
            <label>
              <span>Amount (NGN)</span>
              <input
                autoComplete="off"
                inputMode="numeric"
                min="1"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="e.g. 50000"
                required
                step="1"
                type="number"
                value={amount}
              />
            </label>
            <label>
              <span>Term</span>
              <select onChange={(event) => setLockPeriodDays(Number(event.target.value))} value={lockPeriodDays}>
                {availableTerms.map((days) => <option key={days} value={days}>{days} days</option>)}
              </select>
            </label>
          </div>
          <div className="core-lock-estimate" aria-live="polite">
            <span>Estimated yield at maturity</span>
            <strong>{estimatedYield === null ? 'Enter an amount to estimate' : formatMoney(estimatedYield, currency)}</strong>
            <small>Illustrative calculation using the plan rate and selected term. Daily ledger accrual determines the recorded payout.</small>
          </div>
          {!savings.isKycVerified && (
            <p className="core-lock-kyc-note">Identity verification is required before you can start a plan.</p>
          )}
          {!selectedProduct?.available && (
            <p className="core-lock-setup-note">
              {selectedProduct?.availabilityMessage || 'Plan creation is paused while asset placement, custody, reconciliation and operating controls are prepared.'}
            </p>
          )}
          <button
            className="core-lock-primary"
            disabled={!selectedProduct?.available || !savings.isKycVerified || isSubmittingPlan}
            type="submit"
          >
            {isSubmittingPlan ? 'Starting plan…' : 'Start Core savings plan'} <Icon name="arrowRight" />
          </button>
          <p className="core-lock-form-disclosure">Starting a plan moves the selected amount out of your available wallet and locks it until maturity. Core Flex cannot be withdrawn. Early liquidation forfeits accrued yield and applies a penalty.</p>
        </form>

        <section className="core-lock-goals" aria-labelledby="core-plans-heading">
          <div className="core-lock-section-heading">
            <h2 id="core-plans-heading">Your Core Savings plans</h2>
            <span>{plans.length} total</span>
          </div>
          {plans.length ? (
            plans.map((plan) => (
              <article className="core-lock-plan" key={plan.id}>
                <div className="core-lock-plan-heading">
                  <span className="core-lock-goal-icon"><Icon name="lock" /></span>
                  <div className="core-lock-goal-info">
                    <strong>{plan.productType === 'CORE_TARGET' ? 'Core Target' : 'Core Lock'} · {plan.lockPeriodDays} days</strong>
                    <span>{formatMoney(plan.principalAmount, currency)} principal <i>· matures {formatDate(plan.maturityDate)}</i></span>
                  </div>
                  <span className={`core-lock-plan-status is-${plan.status.toLowerCase()}`}>{plan.status.replace('_', ' ')}</span>
                </div>
                <div className="core-lock-plan-values">
                  <span>Annual rate <strong>{plan.annualYieldPercent}%</strong></span>
                  <span>Accrued yield <strong>{formatMoney(plan.accruedYield, currency)}</strong></span>
                  <span>Estimated payout <strong>{formatMoney(plan.principalAmount + plan.accruedYield, currency)}</strong></span>
                </div>
                {plan.status === 'ACTIVE' && (
                  <form className="core-lock-liquidation" onSubmit={(event) => handleEarlyLiquidation(event, plan)}>
                    <label>
                      <span>Password to confirm early liquidation</span>
                      <input
                        autoComplete="current-password"
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        type="password"
                        value={password}
                      />
                    </label>
                    <button disabled={liquidatingPlanId === plan.id || !password} type="submit">
                      {liquidatingPlanId === plan.id ? 'Processing…' : 'Liquidate early'}
                    </button>
                  </form>
                )}
              </article>
            ))
          ) : (
            <div className="core-lock-empty-goal">
              <span className="core-lock-goal-icon"><Icon name="lock" /></span>
              <div>
                <strong>No Core savings plans yet</strong>
                <p>Your savings goals below are planning tools and do not move or lock money.</p>
              </div>
            </div>
          )}
        </section>

        <section className="core-lock-goals" aria-labelledby="active-goals-heading">
          <div className="core-lock-section-heading">
            <h2 id="active-goals-heading">Your Active Goals</h2>
            <Link to="/dashboard">View all <Icon name="chevron" /></Link>
          </div>
          {goals.length ? (
            goals.map((goal) => (
              <article className="core-lock-goal" key={goal.id}>
                <span className="core-lock-goal-icon"><Icon name={getGoalIcon(goal.name)} /></span>
                <div className="core-lock-goal-info">
                  <strong>{goal.name}</strong>
                  <span>{formatMoney(goal.savedAmount, currency)} <i>/ {formatMoney(goal.targetAmount, currency)}</i></span>
                  <div aria-label={`${goal.progress}% complete`} className="core-lock-progress"><span style={{ width: `${goal.progress}%` }} /></div>
                </div>
                <span className="core-lock-goal-percentage">{goal.progress}%</span>
                <Icon className="core-lock-chevron" name="chevron" />
              </article>
            ))
          ) : (
            <div className="core-lock-empty-goal">
              <span className="core-lock-goal-icon"><Icon name="homeGoal" /></span>
              <div>
                <strong>No active goals yet</strong>
                <p>Create a savings goal to see your progress here.</p>
              </div>
              <Link aria-label="Go to dashboard to create a savings goal" className="core-lock-empty-action" to="/dashboard">
                <span>Create</span><Icon name="chevron" />
              </Link>
            </div>
          )}
        </section>

        <section className="core-lock-steps" aria-label="What to expect when Core Lock launches">
          {lockSteps.map((step) => (
            <article key={step.title}>
              <span><Icon name={step.icon} /></span>
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </article>
          ))}
        </section>

        <div className="core-lock-launch">
          <Link className="core-lock-primary" to="/create-goal">
            Create a savings goal <Icon name="arrowRight" />
          </Link>
          <p>This creates a savings goal only; it does not lock or move money.</p>
        </div>
      </main>

      <nav aria-label="Mobile dashboard navigation" className="core-lock-mobile-nav">
        <Link to="/dashboard"><Icon name="home" /><span>Home</span></Link>
        <Link aria-current="page" className="is-active" to="/core-lock"><Icon name="lock" /><span>Core Lock</span></Link>
        <Link to="/dashboard"><Icon name="invest" /><span>Invest</span></Link>
        <Link to="/dashboard"><Icon name="portfolio" /><span>Portfolio</span></Link>
        <button aria-label="More options are not available yet" disabled type="button"><Icon name="more" /><span>More</span></button>
      </nav>
    </div>
  );
}

export default CoreLock;
