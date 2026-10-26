import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import './More.css';

const settings = [
  { id: 'personal', icon: 'person', title: 'Personal Information', description: 'View your name, email address and phone number.' },
  { id: 'kyc', icon: 'shield', title: 'KYC & Verification', description: 'Review your identity verification status.' },
  { id: 'banks', icon: 'bank', title: 'Linked Bank Accounts', description: 'Manage your payout and funding accounts.' },
  { id: 'security', icon: 'lock', title: 'Security', description: 'Account password and sign-in security.' },
  { id: 'notifications', icon: 'bell', title: 'Notifications', description: 'Manage your alerts and account updates.' },
  { id: 'preferences', icon: 'settings', title: 'Preferences', description: 'Balance visibility and display settings.' },
  { id: 'help', icon: 'headset', title: 'Help & Support', description: 'Get help with your account and products.' },
  { id: 'about', icon: 'info', title: 'About GWIC', description: 'Learn more about Grow With Core.' },
  { id: 'logout', icon: 'logout', title: 'Log Out', description: 'Securely sign out of your account.' },
];

function MoreIcon({ name, className = '' }) {
  const paths = {
    arrowLeft: <path d="m15 18-6-6 6-6M9 12h12" />,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    eyeOff: <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a15.8 15.8 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8" /></>,
    camera: <><path d="M14 5h-4L8.5 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5L14 5Z" /><circle cx="12" cy="13" r="3" /></>,
    person: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c.5-4 3-6 7.5-6s7 2 7.5 6" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    bank: <><path d="m3 9 9-5 9 5H3Zm2 2v7m5-7v7m4-7v7m5-7v7M3 21h18" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.3 1-1.5 2.6-1.6-.6a8 8 0 0 1-1.5.9l-.3 1.7h-3l-.3-1.7a8 8 0 0 1-1.5-.9l-1.6.6L8 16l1.3-1 .1-.1a8 8 0 0 1 0-1.8l-.1-.1L8 12l1.5-2.6 1.6.6a8 8 0 0 1 1.5-.9l.3-1.7h3l.3 1.7a8 8 0 0 1 1.5.9l1.6-.6 1.5 2.6-1.3 1-.1.1a8 8 0 0 1 0 1.9Z" transform="translate(-1 -1)" /></>,
    headset: <><path d="M4 13v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="12" width="4" height="7" rx="2" /><rect x="17" y="12" width="4" height="7" rx="2" /><path d="M17 20c-1 1-2.5 1.5-5 1.5" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
    logout: <><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>,
    core: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    invest: <><path d="M3 20h18M5 17v-5h3v5m3 0V9h3v8m3 0V5h3v12" /><path d="m5 9 5-4 4 2 6-5" /></>,
    sprout: <><path d="M12 21v-9" /><path d="M12 15c-1-4-4-6-8-6 0 4 2.5 7 8 7m0-5c.5-4 3.5-6 8-6 0 4-2.5 7-8 8M7 21h10" /></>,
    portfolio: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M8 16h2l2-3 2 2 3-4" /></>,
    more: <path d="M3 6h18M3 12h18M3 18h18" />,
  };

  return (
    <svg aria-hidden="true" className={`more-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function More() {
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const dialogTriggerRef = useRef(null);
  const [account, setAccount] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [activePanel, setActivePanel] = useState('');
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [balancePreference, setBalancePreference] = useState(() => {
    try {
      return {
        hideBalance: window.localStorage.getItem('gwic.hideWalletBalance') === 'true',
        message: '',
      };
    } catch {
      return {
        hideBalance: false,
        message: 'This browser could not restore your balance privacy preference.',
      };
    }
  });
  const [privacyNotice, setPrivacyNotice] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [actionError, setActionError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const hideBalance = balancePreference.hideBalance;

  function updateBalancePrivacy(hide) {
    try {
      window.localStorage.setItem('gwic.hideWalletBalance', String(hide));
      setBalancePreference({
        hideBalance: hide,
        message: 'Preference saved on this device.',
      });
      setPrivacyNotice('');
    } catch {
      setBalancePreference({
        hideBalance: hide,
        message: 'This browser could not save the preference. It applies for this visit only.',
      });
      setPrivacyNotice('Balance privacy could not be saved on this device. It applies for this visit only.');
    }
  }

  useEffect(() => {
    if (!activePanel) return undefined;
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setActivePanel('');
        return;
      }

      if (event.key !== 'Tab') return;
      const focusableElements = dialogRef.current?.querySelectorAll(
        'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) return;
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('.more-detail-close')?.focus();
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      dialogTriggerRef.current?.focus();
    };
  }, [activePanel]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAccount() {
      setIsLoadingAccount(true);
      setAccountError('');
      try {
        const [accountResponse, walletResponse] = await Promise.all([
          fetch('/api/dashboard', { credentials: 'include', headers: { Accept: 'application/json' }, signal: controller.signal }),
          fetch('/api/wallet', { credentials: 'include', headers: { Accept: 'application/json' }, signal: controller.signal }),
        ]);
        if (accountResponse.status === 401 || walletResponse.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        const [accountData, walletData] = await Promise.all([accountResponse.json(), walletResponse.json()]);
        if (!accountResponse.ok || !walletResponse.ok) {
          throw new Error(accountData.message || walletData.message || 'We could not load your account details.');
        }
        setAccount(accountData.user);
        setWalletBalance(walletData.balance);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setAccountError(requestError instanceof TypeError
            ? 'We could not reach GWIC. Check your connection and try again.'
            : requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingAccount(false);
      }
    }

    loadAccount();
    return () => controller.abort();
  }, [navigate, retryKey]);

  async function handleLogout() {
    setIsLoggingOut(true);
    setActionError('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (!response.ok) throw new Error('Logout could not be confirmed. Please try again.');
      setActivePanel('');
      navigate('/login', { replace: true });
    } catch (requestError) {
      setActionError(requestError instanceof TypeError
        ? 'We could not reach GWIC. Check your connection and try again.'
        : requestError.message);
      setIsLoggingOut(false);
    }
  }

  function retryAccountLoad() {
    setAccountError('');
    setIsLoadingAccount(true);
    setRetryKey((key) => key + 1);
  }

  const money = walletBalance === null
    ? isLoadingAccount ? 'Loading…' : 'Unavailable'
    : hideBalance
      ? '••••••••'
      : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(walletBalance);

  return (
    <div className="more-page">
      <header className="more-header">
        <div className="more-header-top">
          <Link aria-label="Back to home" className="more-back" to="/dashboard"><MoreIcon name="arrowLeft" /></Link>
          <Link aria-label="GWIC home" className="more-brand" to="/">
            <BrandMark className="more-brand-mark" />
            <span><strong>GWIC</strong><small>GrowWithCore</small></span>
          </Link>
          <nav aria-label="Account navigation" className="more-desktop-nav">
            <Link to="/dashboard"><MoreIcon name="home" />Home</Link>
            <Link to="/core-lock"><MoreIcon name="core" />Core Lock</Link>
            <Link to="/dashboard#account-balances"><MoreIcon name="invest" />Invest</Link>
            <Link to="/activity"><MoreIcon name="portfolio" />Portfolio</Link>
            <Link aria-current="page" className="is-active" to="/more"><MoreIcon name="more" />More</Link>
          </nav>
          <button aria-label="Notifications" className="more-header-action" onClick={(event) => { dialogTriggerRef.current = event.currentTarget; setActivePanel('notifications'); }} type="button">
            <MoreIcon name="bell" />
          </button>
          <button aria-label="Your profile" className="more-header-avatar" onClick={(event) => { dialogTriggerRef.current = event.currentTarget; setActivePanel('personal'); }} type="button">
            <MoreIcon name="person" />
          </button>
        </div>
        <button className="more-profile-summary" onClick={(event) => { dialogTriggerRef.current = event.currentTarget; setActivePanel('personal'); }} type="button">
          <span className="more-profile-avatar">
            <MoreIcon name="person" />
            <span aria-hidden="true" className="more-profile-camera"><MoreIcon name="camera" /></span>
          </span>
          <span className="more-profile-copy">
            <strong>{account?.name || (isLoadingAccount ? 'Loading your account…' : 'Your account')}</strong>
            <small>{account?.email || (isLoadingAccount ? 'Please wait' : 'Account details unavailable')}</small>
            <span className={`more-verification ${account?.isKycVerified ? 'is-verified' : ''} ${isLoadingAccount ? 'is-loading' : ''}`}>
              <MoreIcon name="shield" />{isLoadingAccount
                ? 'Checking verification'
                : account?.isKycVerified
                  ? 'Verified Account'
                  : account ? 'Verification needed' : 'Status unavailable'}
            </span>
          </span>
          <MoreIcon className="more-profile-chevron" name="chevron" />
        </button>
      </header>

      <main className="more-content">
        <section aria-label="Account balance" className="more-value-card">
          <div className="more-value-copy">
            <div className="more-value-label">
              <span>Wallet Balance</span>
              <button
                aria-label={hideBalance ? 'Show wallet balance' : 'Hide wallet balance'}
                aria-pressed={hideBalance}
                onClick={() => updateBalancePrivacy(!hideBalance)}
                type="button"
              >
                <MoreIcon name={hideBalance ? 'eyeOff' : 'eye'} />
              </button>
            </div>
            <strong>{money}</strong>
            <small>Available wallet funds</small>
          </div>
          <div className="more-value-note">
            <MoreIcon name="invest" />
            <span>Track your wallet<br />activity anytime.</span>
            <Link aria-label="View wallet activity" to="/activity"><MoreIcon name="chevron" /></Link>
          </div>
        </section>

        {privacyNotice && <p className="more-privacy-notice" role="status">{privacyNotice}</p>}

        {accountError && !activePanel && (
          <div className="more-error" role="alert">
            <span>{accountError}</span>
            <button onClick={retryAccountLoad} type="button">Retry</button>
          </div>
        )}

        <section aria-label="Account settings" className="more-settings-list">
          {settings.map((item) => (
            <button
              aria-expanded={activePanel === item.id}
              aria-controls="more-settings-dialog"
              aria-haspopup="dialog"
              className="more-setting-row"
              disabled={item.id === 'logout' && isLoggingOut}
              key={item.id}
              onClick={(event) => {
                dialogTriggerRef.current = event.currentTarget;
                setActivePanel(item.id);
              }}
              type="button"
            >
              <span className="more-setting-icon"><MoreIcon name={item.icon} /></span>
              <span className="more-setting-copy">
                <strong>{item.id === 'logout' && isLoggingOut ? 'Signing Out…' : item.title}</strong>
                <small>{item.description}</small>
              </span>
              <MoreIcon className="more-setting-chevron" name="chevron" />
            </button>
          ))}
        </section>

        {activePanel && (
          <div className="more-dialog-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActivePanel('');
          }}>
            <section aria-labelledby="more-detail-title" aria-modal="true" className="more-detail-panel" id="more-settings-dialog" ref={dialogRef} role="dialog">
              <div className="more-detail-handle" />
              <button aria-label="Close details" autoFocus className="more-detail-close" onClick={() => setActivePanel('')} type="button">×</button>
              {accountError && (
                <div className="more-dialog-error" role="alert">
                  <span>{accountError}</span>
                  <button onClick={retryAccountLoad} type="button">Retry</button>
                </div>
              )}
              {actionError && <p className="more-dialog-error" role="alert">{actionError}</p>}
              {activePanel === 'personal' && (
                <>
                  <h2 id="more-detail-title">Personal Information</h2>
                  {isLoadingAccount
                    ? <p aria-live="polite">Loading your account details…</p>
                    : account
                      ? <dl>
                        <div><dt>Full name</dt><dd>{account.name}</dd></div>
                        <div><dt>Email address</dt><dd>{account.email}</dd></div>
                        <div><dt>Phone number</dt><dd>{account.phone || 'Not provided'}</dd></div>
                      </dl>
                      : <p role="alert">Your account details could not be loaded. Use Retry above to try again.</p>}
                  <p className="more-detail-note">Need to update your details or profile photo? Editing is not available yet.</p>
                </>
              )}
              {activePanel === 'kyc' && (
                <>
                  <h2 id="more-detail-title">KYC & Verification</h2>
                  {isLoadingAccount
                    ? <p aria-live="polite">Checking your verification status…</p>
                    : account
                      ? <div className={`more-status-card ${account.isKycVerified ? 'is-complete' : ''}`}>
                        <MoreIcon name="shield" />
                        <span><strong>{account.isKycVerified ? 'Verified account' : 'Verification not complete'}</strong>
                          <small>{account.isKycVerified
                            ? 'Your account verification is confirmed.'
                            : 'Identity verification is not available yet. Core savings remains unavailable until verification is completed.'}</small>
                        </span>
                      </div>
                      : <p role="alert">We could not load your verification status. Please retry from the More page.</p>}
                </>
              )}
              {activePanel === 'banks' && (
                <>
                  <h2 id="more-detail-title">Linked Bank Accounts</h2>
                  <p>Bank details are verified securely when you request a wallet withdrawal. No bank account is currently saved.</p>
                  <Link className="more-detail-action" to="/dashboard#wallet-actions" onClick={() => setActivePanel('')}>Manage wallet</Link>
                </>
              )}
              {activePanel === 'security' && (
                <>
                  <h2 id="more-detail-title">Security</h2>
                  <p>Password changes, PINs, and biometric sign-in are not available yet. Keep your password private and sign out when using a shared device.</p>
                  <button className="more-detail-action is-secondary" disabled={isLoggingOut} onClick={handleLogout} type="button">
                    {isLoggingOut ? 'Signing out…' : 'Sign out securely'}
                  </button>
                </>
              )}
              {activePanel === 'notifications' && (
                <>
                  <h2 id="more-detail-title">Notifications</h2>
                  <p>Push and email notification controls are not available yet. Important account updates will appear in your activity history.</p>
                  <Link className="more-detail-action is-secondary" to="/activity" onClick={() => setActivePanel('')}>View activity</Link>
                </>
              )}
              {activePanel === 'preferences' && (
                <>
                  <h2 id="more-detail-title">Preferences</h2>
                  <label className="more-balance-toggle">
                    <span><strong>Hide wallet balance</strong><small>Keep your balance private on this screen.</small></span>
                    <input
                      checked={hideBalance}
                      onChange={(event) => updateBalancePrivacy(event.target.checked)}
                      type="checkbox"
                      role="switch"
                    />
                  </label>
                  <p aria-live="polite" className="more-preference-message">{balancePreference.message || 'Your preference is saved on this device.'}</p>
                </>
              )}
              {activePanel === 'help' && (
                <>
                  <h2 id="more-detail-title">Help & Support</h2>
                  <p>Browse product information and answers to common questions.</p>
                  <Link className="more-detail-action" to="/#faq" onClick={() => setActivePanel('')}>Visit help & FAQs</Link>
                </>
              )}
              {activePanel === 'about' && (
                <>
                  <h2 id="more-detail-title">About GWIC</h2>
                  <p>Grow With Core — building better habits for stronger finances and a brighter future.</p>
                  <Link className="more-detail-action is-secondary" to="/" onClick={() => setActivePanel('')}>Learn more</Link>
                </>
              )}
              {activePanel === 'logout' && (
                <>
                  <h2 id="more-detail-title">Sign out?</h2>
                  <p>You’ll need to sign in again to access your GWIC account.</p>
                  <div className="more-logout-actions">
                    <button className="more-detail-action is-secondary" onClick={() => setActivePanel('')} type="button">Stay signed in</button>
                    <button className="more-detail-action is-danger" disabled={isLoggingOut} onClick={handleLogout} type="button">
                      {isLoggingOut ? 'Signing out…' : 'Sign out'}
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        <aside className="more-brand-card">
          <span className="more-brand-card-icon"><MoreIcon name="sprout" /></span>
          <span><strong>Grow With Core</strong><small>Better habits. Stronger finances. A brighter future.</small></span>
          <span className="more-brand-card-logo"><BrandMark /><strong>GWIC<small>GrowWithCore</small></strong></span>
        </aside>
      </main>

      <nav aria-label="Main navigation" className="more-bottom-nav">
        <Link to="/dashboard"><MoreIcon name="home" /><span>Home</span></Link>
        <Link to="/core-lock"><MoreIcon name="core" /><span>Core Lock</span></Link>
        <Link to="/dashboard#account-balances"><MoreIcon name="invest" /><span>Invest</span></Link>
        <Link to="/activity"><MoreIcon name="portfolio" /><span>Portfolio</span></Link>
        <Link aria-current="page" className="is-active" to="/more"><MoreIcon name="more" /><span>More</span></Link>
      </nav>
    </div>
  );
}

export default More;
