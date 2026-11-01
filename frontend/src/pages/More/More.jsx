import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import './More.css';

const settings = [
  { id: 'personal', icon: 'person', title: 'Personal Information', description: 'Update your name and phone number.' },
  { id: 'kyc', icon: 'shield', title: 'KYC & Verification', description: 'Submit and track an account verification request.' },
  { id: 'banks', icon: 'bank', title: 'Linked Bank Accounts', description: 'Manage verified accounts for wallet withdrawals.' },
  { id: 'security', icon: 'lock', title: 'Security', description: 'Change your password and protect your account.' },
  { id: 'notifications', icon: 'bell', title: 'Notifications', description: 'Choose how you want to receive account updates.' },
  { id: 'preferences', icon: 'settings', title: 'Preferences', description: 'Choose whether your wallet balance is visible.' },
  { id: 'help', icon: 'headset', title: 'Help & Support', description: 'Send a support request and track its status.' },
  { id: 'about', icon: 'info', title: 'About GWIC', description: 'Learn more about Grow With Core.' },
  { id: 'logout', icon: 'logout', title: 'Log Out', description: 'Securely sign out of your account.' },
];

function MoreIcon({ name, className = '' }) {
  const paths = {
    arrowLeft: <path d="m15 18-6-6 6-6M9 12h12" />,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    eyeOff: <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a15.8 15.8 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8" /></>,
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

async function accountRequest(path, { method = 'GET', body, signal } = {}) {
  const isFormData = body instanceof FormData;
  const response = await fetch(path, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
    ...(signal ? { signal } : {}),
  });
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok) {
    const error = new Error(result.message || 'We could not complete this account request.');
    error.status = response.status;
    throw error;
  }
  return result;
}

function More() {
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const dialogTriggerRef = useRef(null);
  const photoFileInputRef = useRef(null);
  const [account, setAccount] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [profileForm, setProfileForm] = useState({ phone: '' });
  const [preferences, setPreferences] = useState({ hideWalletBalance: false, theme: 'system', language: 'en' });
  const [notifications, setNotifications] = useState({
    emailAccountUpdates: true,
    emailSecurityAlerts: true,
    pushNotifications: false,
  });
  const [notificationDelivery, setNotificationDelivery] = useState({ email: false, push: false });
  const [verification, setVerification] = useState(null);
  const [linkedBanks, setLinkedBanks] = useState([]);
  const [bankDirectory, setBankDirectory] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [about, setAbout] = useState(null);
  const [activePanel, setActivePanel] = useState('');
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankPassword, setBankPassword] = useState('');
  const [bankForm, setBankForm] = useState({ accountNumber: '', bankCode: '', search: '' });
  const [securityForm, setSecurityForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [verificationForm, setVerificationForm] = useState({ legalName: '', dateOfBirth: '', consent: false });
  const [supportForm, setSupportForm] = useState({ category: 'account', subject: '', message: '' });
  const [retryKey, setRetryKey] = useState(0);
  const hideBalance = preferences.hideWalletBalance;

  function showActionError(error) {
    if (error.status === 401) {
      navigate('/login', { replace: true });
      return;
    }
    setActionError(error.message);
  }

  async function savePreference(key, value) {
    setIsSaving(true);
    setActionError('');
    setActionMessage('');
    try {
      const result = await accountRequest('/api/account/preferences', {
        method: 'PATCH',
        body: { [key]: value },
      });
      setPreferences(result.preferences);
      setActionMessage(result.message);
    } catch (requestError) {
      showActionError(requestError);
    } finally {
      setIsSaving(false);
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
        const results = await Promise.all([
          accountRequest('/api/account/profile', { signal: controller.signal }),
          accountRequest('/api/wallet', { signal: controller.signal }),
          accountRequest('/api/account/preferences', { signal: controller.signal }),
          accountRequest('/api/account/notifications', { signal: controller.signal }),
          accountRequest('/api/account/verification', { signal: controller.signal }),
          accountRequest('/api/account/banks', { signal: controller.signal }),
        ]);
        const [profileData, walletData, preferenceData, notificationData, verificationData, bankData] = results;
        setAccount(profileData.profile);
        setProfileForm({ phone: profileData.profile.phone || '' });
        setWalletBalance(walletData.balance);
        setPreferences(preferenceData.preferences);
        setNotifications(notificationData.preferences);
        setNotificationDelivery(notificationData.delivery);
        setVerification(verificationData);
        setLinkedBanks(bankData.banks);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          if (requestError.status === 401) {
            navigate('/login', { replace: true });
            return;
          }
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

  useEffect(() => {
    if (!activePanel) return undefined;
    const controller = new AbortController();
    async function loadPanelData() {
      setActionError('');
      setActionMessage('');
      try {
        if (activePanel === 'banks') {
          setBankLoading(true);
          const [directory, linked] = await Promise.allSettled([
            accountRequest('/api/wallet/banks', { signal: controller.signal }),
            accountRequest('/api/account/banks', { signal: controller.signal }),
          ]);
          if (linked.status === 'rejected') throw linked.reason;
          setLinkedBanks(linked.value.banks);
          if (directory.status === 'rejected') {
            if (directory.reason.status === 401) {
              navigate('/login', { replace: true });
              return;
            }
            setBankDirectory([]);
            setActionError('Bank options are unavailable. You can still manage saved accounts; try again later to link another bank.');
          } else {
            setBankDirectory(directory.value.banks);
          }
        } else if (activePanel === 'help') {
          const result = await accountRequest('/api/account/support', { signal: controller.signal });
          setSupportRequests(result.requests);
        } else if (activePanel === 'about') {
          const result = await accountRequest('/api/account/about', { signal: controller.signal });
          setAbout(result);
        }
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          if (requestError.status === 401) {
            navigate('/login', { replace: true });
            return;
          }
          setActionError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) setBankLoading(false);
      }
    }
    loadPanelData();
    return () => controller.abort();
  }, [activePanel, navigate]);

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

  async function saveProfile(event) {
    event.preventDefault();
    setIsSaving(true);
    setActionError('');
    setActionMessage('');
    try {
      const result = await accountRequest('/api/account/profile', {
        method: 'PATCH',
        body: { phone: profileForm.phone },
      });
      setAccount(result.profile);
      setProfileForm({ phone: result.profile.phone || '' });
      setActionMessage(result.message);
    } catch (requestError) {
      showActionError(requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadProfilePhoto(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setActionError('Choose a PNG, JPEG, or WebP photo under 2 MB.');
      input.value = '';
      return;
    }

    setIsSaving(true);
    setActionError('');
    setActionMessage('');
    try {
      const body = new FormData();
      body.append('photo', file);
      const result = await accountRequest('/api/account/profile/photo', { method: 'POST', body });
      setAccount((current) => ({ ...current, photoUrl: result.photoUrl }));
      setPhotoLoadFailed(false);
      setActionMessage(result.message);
    } catch (requestError) {
      showActionError(requestError);
    } finally {
      setIsSaving(false);
      input.value = '';
    }
  }

  async function removeProfilePhoto() {
    if (!window.confirm('Remove your profile photo?')) return;
    setIsSaving(true);
    setActionError('');
    setActionMessage('');
    try {
      const result = await accountRequest('/api/account/profile/photo', { method: 'DELETE' });
      setAccount((current) => ({ ...current, photoUrl: null }));
      setPhotoLoadFailed(false);
      setActionMessage(result.message);
    } catch (requestError) {
      showActionError(requestError);
    } finally {
      setIsSaving(false);
    }
  }

  function requestNameCorrection() {
    setSupportForm({
      category: 'account',
      subject: 'Request account name correction',
      message: 'I need to request a correction to the name on my account. Please let me know how to verify the correct legal name.',
    });
    setActivePanel('help');
  }

  async function submitVerification(event) {
    event.preventDefault();
    setIsSaving(true);
    setActionError('');
    setActionMessage('');
    try {
      const result = await accountRequest('/api/account/verification', {
        method: 'POST',
        body: verificationForm,
      });
      setVerification((current) => ({
        ...current,
        status: result.status,
        canSubmit: false,
        request: { id: result.requestId, status: result.status, legalName: verificationForm.legalName },
      }));
      setActionMessage(result.message);
    } catch (requestError) {
      showActionError(requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function linkBankAccount(event) {
    event.preventDefault();
    setIsSaving(true);
    setActionError('');
    setActionMessage('');
    try {
      const result = await accountRequest('/api/account/banks', {
        method: 'POST',
        body: {
          accountNumber: bankForm.accountNumber,
          bankCode: bankForm.bankCode,
          password: bankPassword,
        },
      });
      setLinkedBanks((current) => [...current, result.bank].sort((first, second) => Number(second.isDefault) - Number(first.isDefault)));
      setBankForm({ accountNumber: '', bankCode: '', search: '' });
      setBankPassword('');
      setActionMessage(result.message);
    } catch (requestError) {
      showActionError(requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function updateLinkedBank(bankId, action) {
    setIsSaving(true);
    setActionError('');
    setActionMessage('');
    try {
      const result = action === 'default'
        ? await accountRequest(`/api/account/banks/${bankId}/default`, { method: 'PATCH', body: {} })
        : await accountRequest(`/api/account/banks/${bankId}`, { method: 'DELETE' });
      const response = await accountRequest('/api/account/banks');
      setLinkedBanks(response.banks);
      setActionMessage(result.message);
    } catch (requestError) {
      showActionError(requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function updateNotification(key, value) {
    const previousValue = notifications[key];
    setIsSaving(true);
    setNotifications((current) => ({ ...current, [key]: value }));
    setActionError('');
    setActionMessage('');
    try {
      const result = await accountRequest('/api/account/notifications', {
        method: 'PATCH',
        body: { [key]: value },
      });
      setNotifications(result.preferences);
      setNotificationDelivery(result.delivery);
      setActionMessage(result.message);
    } catch (requestError) {
      setNotifications((current) => ({ ...current, [key]: previousValue }));
      showActionError(requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setActionError('The new password and confirmation do not match.');
      return;
    }
    setIsSaving(true);
    setActionError('');
    setActionMessage('');
    try {
      const result = await accountRequest('/api/account/password', {
        method: 'PATCH',
        body: {
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword,
        },
      });
      setActionMessage(result.message);
      navigate('/login', { replace: true, state: { passwordChanged: true } });
    } catch (requestError) {
      showActionError(requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function createSupportRequest(event) {
    event.preventDefault();
    setIsSaving(true);
    setActionError('');
    setActionMessage('');
    try {
      const result = await accountRequest('/api/account/support', {
        method: 'POST',
        body: supportForm,
      });
      setSupportRequests((current) => [result.request, ...current]);
      setSupportForm({ category: 'account', subject: '', message: '' });
      setActionMessage(`Request ${result.request.reference} was received.`);
    } catch (requestError) {
      showActionError(requestError);
    } finally {
      setIsSaving(false);
    }
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
            <Link to="/invest"><MoreIcon name="invest" />Invest</Link>
            <Link to="/portfolio"><MoreIcon name="portfolio" />Portfolio</Link>
            <Link aria-current="page" className="is-active" to="/more"><MoreIcon name="more" />More</Link>
          </nav>
          <button aria-label="Notifications" className="more-header-action" onClick={(event) => { dialogTriggerRef.current = event.currentTarget; setActivePanel('notifications'); }} type="button">
            <MoreIcon name="bell" />
          </button>
          <button aria-label="Your profile" className="more-header-avatar" onClick={(event) => { dialogTriggerRef.current = event.currentTarget; setActivePanel('personal'); }} type="button">
            {account?.photoUrl && !photoLoadFailed ? <img alt="" className="more-header-profile-photo" onError={() => setPhotoLoadFailed(true)} src={account.photoUrl} /> : <MoreIcon name="person" />}
          </button>
        </div>
        <button className="more-profile-summary" onClick={(event) => { dialogTriggerRef.current = event.currentTarget; setActivePanel('personal'); }} type="button">
          <span className="more-profile-avatar">
            {account?.photoUrl && !photoLoadFailed ? <img alt="" className="more-profile-photo" onError={() => setPhotoLoadFailed(true)} src={account.photoUrl} /> : <MoreIcon name="person" />}
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
                disabled={isSaving}
                onClick={() => savePreference('hideWalletBalance', !hideBalance)}
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

        {accountError && !activePanel && (
          <div className="more-error" role="alert">
            <span>{accountError}</span>
            <button onClick={retryAccountLoad} type="button">Retry</button>
          </div>
        )}
        {actionError && !activePanel && <p className="more-dialog-error" role="alert">{actionError}</p>}
        {actionMessage && !activePanel && <p aria-live="polite" className="more-action-message">{actionMessage}</p>}

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
                    : account && <>
                      <div className="more-profile-photo-controls">
                        <label htmlFor="more-profile-photo">Profile photo</label>
                        <input
                          accept="image/jpeg,image/png,image/webp"
                          className="more-file-input"
                          disabled={isSaving || !account.photoUploadAvailable}
                          id="more-profile-photo"
                          onChange={uploadProfilePhoto}
                          ref={photoFileInputRef}
                          type="file"
                        />
                        <div>
                          <button className="more-detail-action is-secondary" disabled={isSaving || !account.photoUploadAvailable} onClick={() => photoFileInputRef.current?.click()} type="button">
                            {!account.photoUploadAvailable ? 'Photo uploads unavailable' : account.photoUrl ? 'Change photo' : 'Add photo'}
                          </button>
                          {account.photoUrl && <button className="more-detail-action is-secondary" disabled={isSaving || !account.photoUploadAvailable} onClick={removeProfilePhoto} type="button">Remove photo</button>}
                        </div>
                        <small className="more-form-note">{account.photoUploadAvailable ? 'PNG, JPEG, or WebP up to 2 MB. This is only a profile photo—not identity verification. Don’t upload an ID document.' : 'Profile photo storage is being configured and is not available yet.'}</small>
                      </div>
                      <form className="more-form" onSubmit={saveProfile}>
                      <label>Full name<input autoComplete="name" readOnly value={account.name} /></label>
                      <small className="more-form-note">Your account name is locked because it must match the name on your verified bank account. For a correction, contact support.</small>
                      <label>Email address<input autoComplete="email" readOnly value={account.email} /></label>
                      <small className="more-form-note">Email changes require a separate verification flow and cannot be changed here.</small>
                      <label>Phone number<input autoComplete="tel" maxLength="32" onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} type="tel" value={profileForm.phone} /></label>
                      <button className="more-detail-action" disabled={isSaving} type="submit">{isSaving ? 'Saving…' : 'Save profile'}</button>
                      <button className="more-detail-action is-secondary" onClick={requestNameCorrection} type="button">Request a name correction</button>
                      </form>
                    </>}
                  {!isLoadingAccount && !account && <p role="alert">Your account details could not be loaded. Use Retry above to try again.</p>}
                </>
              )}
              {activePanel === 'kyc' && (
                <>
                  <h2 id="more-detail-title">KYC & Verification</h2>
                  {isLoadingAccount
                    ? <p aria-live="polite">Checking your verification status…</p>
                    : !verification
                      ? <p role="alert">Your verification status could not be loaded. Use Retry above to try again.</p>
                    : <div className={`more-status-card ${verification.status === 'verified' ? 'is-complete' : ''}`}>
                      <MoreIcon name="shield" />
                      <span><strong>{verification.status === 'verified' ? 'Verified account' : verification.status === 'pending' ? 'Request under review' : verification.status === 'rejected' ? 'Request needs attention' : 'Verification not complete'}</strong>
                        <small>{verification.status === 'verified'
                          ? 'Your account verification is confirmed.'
                          : verification.status === 'pending'
                            ? 'Your request has been submitted and is awaiting manual review.'
                            : verification.status === 'rejected'
                              ? 'Your previous request was not approved. You can submit a new request for manual review.'
                              : 'Submit a request for manual review. Sending this request does not verify your account.'}</small>
                      </span>
                    </div>}
                  {verification?.notice && <p className="more-form-note">{verification.notice}</p>}
                  {verification?.canSubmit && <form className="more-form" onSubmit={submitVerification}>
                    <label>Legal name<input autoComplete="name" maxLength="100" minLength="2" onChange={(event) => setVerificationForm((current) => ({ ...current, legalName: event.target.value }))} required value={verificationForm.legalName} /></label>
                    <label>Date of birth<input autoComplete="bday" max={new Date().toISOString().slice(0, 10)} onChange={(event) => setVerificationForm((current) => ({ ...current, dateOfBirth: event.target.value }))} required type="date" value={verificationForm.dateOfBirth} /></label>
                    <label className="more-checkbox-label"><input checked={verificationForm.consent} onChange={(event) => setVerificationForm((current) => ({ ...current, consent: event.target.checked }))} required type="checkbox" /> I consent to this information being used for a manual account verification review.</label>
                    <button className="more-detail-action" disabled={isSaving} type="submit">{isSaving ? 'Submitting…' : 'Submit for review'}</button>
                  </form>}
                </>
              )}
              {activePanel === 'banks' && (
                <>
                  <h2 id="more-detail-title">Linked Bank Accounts</h2>
                  <p>Link a bank account to make future withdrawals faster. GWIC verifies the account holder with its payment provider and stores a masked account reference.</p>
                  <p className="more-form-note">{linkedBanks.length} of 3 bank accounts linked. Each account must be verified against your GWIC profile name.</p>
                  {bankLoading
                    ? <p aria-live="polite">Loading your linked bank accounts…</p>
                    : <div className="more-linked-banks">{linkedBanks.length
                      ? linkedBanks.map((bank) => <article className="more-linked-bank" key={bank.id}>
                        <span><strong>{bank.bankName}</strong><small>{bank.accountName} ···· {bank.accountLast4}{bank.isDefault ? ' · Default' : ''}</small></span>
                        <span className="more-bank-actions">
                          {!bank.isDefault && <button disabled={isSaving} onClick={() => updateLinkedBank(bank.id, 'default')} type="button">Make default</button>}
                          <button disabled={isSaving} onClick={() => updateLinkedBank(bank.id, 'remove')} type="button">Remove</button>
                        </span>
                      </article>)
                      : <p>No bank accounts are linked yet.</p>}</div>}
                  {linkedBanks.length < 3 ? <form className="more-form" onSubmit={linkBankAccount}>
                    <label>Find your bank<input autoComplete="off" onChange={(event) => setBankForm((current) => ({ ...current, search: event.target.value, bankCode: '' }))} placeholder="Search Nigerian banks" value={bankForm.search} /></label>
                    <label>Bank<select onChange={(event) => {
                      const selectedBank = bankDirectory.find((bank) => bank.code === event.target.value);
                      setBankForm((current) => ({ ...current, bankCode: event.target.value, search: selectedBank?.name || current.search }));
                    }} required value={bankForm.bankCode}>
                      <option value="">Select a bank</option>
                      {bankDirectory.filter((bank) => bank.name.toLowerCase().includes(bankForm.search.toLowerCase())).map((bank) => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
                    </select></label>
                    <label>10-digit account number<input autoComplete="off" inputMode="numeric" maxLength="10" minLength="10" onChange={(event) => setBankForm((current) => ({ ...current, accountNumber: event.target.value.replace(/\D/g, '').slice(0, 10) }))} required value={bankForm.accountNumber} /></label>
                    <label>Confirm with your password<input autoComplete="current-password" onChange={(event) => setBankPassword(event.target.value)} required type="password" value={bankPassword} /></label>
                    <button className="more-detail-action" disabled={isSaving || bankLoading || !bankDirectory.length} type="submit">{isSaving ? 'Verifying…' : 'Verify and link account'}</button>
                    {!bankDirectory.length && !bankLoading && <small className="more-form-note">Bank options are unavailable right now. Close and reopen this panel to retry.</small>}
                  </form> : <p className="more-form-note">You’ve reached the 3-account limit. Remove a linked account before adding another.</p>}
                </>
              )}
              {activePanel === 'security' && (
                <>
                  <h2 id="more-detail-title">Security</h2>
                  <p>Choose a new password you do not use elsewhere. You will be asked to sign in again after the change.</p>
                  <form className="more-form" onSubmit={changePassword}>
                    <label>Current password<input autoComplete="current-password" onChange={(event) => setSecurityForm((current) => ({ ...current, currentPassword: event.target.value }))} required type="password" value={securityForm.currentPassword} /></label>
                    <label>New password<input autoComplete="new-password" minLength="8" onChange={(event) => setSecurityForm((current) => ({ ...current, newPassword: event.target.value }))} required type="password" value={securityForm.newPassword} /></label>
                    <label>Confirm new password<input autoComplete="new-password" minLength="8" onChange={(event) => setSecurityForm((current) => ({ ...current, confirmPassword: event.target.value }))} required type="password" value={securityForm.confirmPassword} /></label>
                    <button className="more-detail-action" disabled={isSaving} type="submit">{isSaving ? 'Updating…' : 'Change password'}</button>
                  </form>
                </>
              )}
              {activePanel === 'notifications' && (
                <>
                  <h2 id="more-detail-title">Notifications</h2>
                  <p>Email and push notifications are not available yet. These settings won’t change the messages you receive.</p>
                  <div className="more-toggle-list">
                    {[
                      ['emailAccountUpdates', 'Account updates', 'email'],
                      ['emailSecurityAlerts', 'Security alerts', 'email'],
                      ['pushNotifications', 'Push notifications', 'push'],
                    ].map(([key, title, channel]) => <label className="more-balance-toggle" key={key}>
                      <span><strong>{title}</strong><small>{notificationDelivery[channel] ? 'Available' : `${channel === 'email' ? 'Email' : 'Push'} delivery unavailable`}</small></span>
                      <input checked={notifications[key]} disabled={isSaving || !notificationDelivery[channel]} onChange={(event) => updateNotification(key, event.target.checked)} type="checkbox" role="switch" />
                    </label>)}
                  </div>
                </>
              )}
              {activePanel === 'preferences' && (
                <>
                  <h2 id="more-detail-title">Preferences</h2>
                  <label className="more-balance-toggle">
                    <span><strong>Hide wallet balance</strong><small>Keep your balance private on this screen.</small></span>
                    <input
                      checked={hideBalance}
                      onChange={(event) => savePreference('hideWalletBalance', event.target.checked)}
                      type="checkbox"
                      role="switch"
                    />
                  </label>
                  <p aria-live="polite" className="more-preference-message">{actionMessage || 'Preferences are saved to your account.'}</p>
                </>
              )}
              {activePanel === 'help' && (
                <>
                  <h2 id="more-detail-title">Help & Support</h2>
                  <p>Send a request to the GWIC team and track its status here.</p>
                  <p className="more-form-note">Do not include passwords, BVNs, full bank account numbers, or other sensitive credentials in a support request.</p>
                  <form className="more-form" onSubmit={createSupportRequest}>
                    <label>Topic<select onChange={(event) => setSupportForm((current) => ({ ...current, category: event.target.value }))} value={supportForm.category}>
                      <option value="account">Account</option><option value="verification">Verification</option><option value="payments">Payments</option><option value="technical">Technical issue</option><option value="other">Other</option>
                    </select></label>
                    <label>Subject<input maxLength="120" minLength="3" onChange={(event) => setSupportForm((current) => ({ ...current, subject: event.target.value }))} required value={supportForm.subject} /></label>
                    <label>How can we help?<textarea maxLength="2000" minLength="10" onChange={(event) => setSupportForm((current) => ({ ...current, message: event.target.value }))} required rows="4" value={supportForm.message} /></label>
                    <button className="more-detail-action" disabled={isSaving} type="submit">{isSaving ? 'Sending…' : 'Send support request'}</button>
                  </form>
                  <h3 className="more-subsection-title">Your requests</h3>
                  {supportRequests.length
                    ? <div className="more-support-list">{supportRequests.map((request) => <article className="more-support-item" key={request.reference}>
                      <strong>{request.subject}</strong><small>{request.reference} · {request.status.replace('_', ' ')}</small><p>{request.message}</p>
                    </article>)}</div>
                    : <p>No support requests yet.</p>}
                </>
              )}
              {activePanel === 'about' && (
                <>
                  <h2 id="more-detail-title">About GWIC</h2>
                  <p>{about?.description || 'Grow With Core — building better habits for stronger finances and a brighter future.'}</p>
                  {about?.products && <p>Products: {about.products.join(', ')}</p>}
                  <Link className="more-detail-action is-secondary" to="/" onClick={() => setActivePanel('')}>Visit GWIC</Link>
                </>
              )}
              {actionMessage && !['preferences'].includes(activePanel) && <p aria-live="polite" className="more-action-message">{actionMessage}</p>}
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
        <Link to="/invest"><MoreIcon name="invest" /><span>Invest</span></Link>
        <Link to="/portfolio"><MoreIcon name="portfolio" /><span>Portfolio</span></Link>
        <Link aria-current="page" className="is-active" to="/more"><MoreIcon name="more" /><span>More</span></Link>
      </nav>
    </div>
  );
}

export default More;
