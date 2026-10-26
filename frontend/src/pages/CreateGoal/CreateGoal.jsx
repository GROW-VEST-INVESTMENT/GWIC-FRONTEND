import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import sproutCoins from './savings-sprout.png';
import './CreateGoal.css';

const templates = [
  { id: 'emergency', name: 'Emergency Fund', icon: 'home' },
  { id: 'car', name: 'Car Purchase', icon: 'car' },
  { id: 'education', name: 'Education', icon: 'education' },
  { id: 'travel', name: 'Travel', icon: 'travel' },
  { id: 'phone', name: 'New Phone', icon: 'phone' },
  { id: 'wedding', name: 'Wedding', icon: 'wedding' },
  { id: 'house', name: 'House Deposit', icon: 'house' },
  { id: 'custom', name: 'Custom Goal', icon: 'plus' },
];

const durations = [30, 90, 180, 365];
const frequencies = ['Weekly', 'Monthly'];

function GoalIcon({ name, className = '' }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    back: <><path d="m15 18-6-6 6-6" /><path d="M9 12h12" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h2m4 0h2m-8 3h2" /></>,
    car: <><path d="m4 11 2-5h12l2 5 2 2v5h-2v-2H4v2H2v-5l2-2Z" /><path d="M4 11h16m-12 3h.01m8 0h.01" /></>,
    education: <><path d="m2 9 10-5 10 5-10 5L2 9Z" /><path d="M6 11v5c4 3 8 3 12 0v-5m5-2v7" /></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l-.8 5Z" /><path d="m13.5 6.5 4 4" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10m-9 10v-6h4v6" /></>,
    house: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10m-9 10v-6h4v6" /><path d="M9 10h.01m6 0h.01" /></>,
    invest: <><path d="M3 20h18M6 17v-5h3v5m3 0V8h3v9m3 0V4h3v13" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
    more: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    phone: <><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18.5h2" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /><path d="m16 8 5-5m-4 0h4v4" /></>,
    travel: <><path d="m21 3-7 18-4-8-8-4 19-6Z" /><path d="m10 13 5-5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    wedding: <><path d="M12 21s-8-4.5-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6.5-8 11-8 11Z" /><path d="M12 9v6m-3-3h6" /></>,
  };

  return (
    <svg aria-hidden="true" className={`create-goal-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || paths.plus}
    </svg>
  );
}

function formatAmountInput(value) {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits).toLocaleString('en-NG') : '';
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function CreateGoal() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState('emergency');
  const [goalName, setGoalName] = useState('Emergency Fund');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [contributionAmount, setContributionAmount] = useState('');
  const [frequency, setFrequency] = useState('Weekly');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minimumDate = useMemo(() => localDateString(new Date()), []);
  const amount = Number(targetAmount.replace(/,/g, ''));
  const contribution = Number(contributionAmount.replace(/,/g, ''));
  const selectedDuration = durations.includes(durationDays) ? durationDays : 30;

  function selectTemplate(template) {
    setSelectedTemplate(template.id);
    if (template.id !== 'custom') setGoalName(template.name);
    else setGoalName('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1000000000000) {
      setError('Enter a whole-number target amount of at least ₦1.');
      return;
    }
    if (contributionAmount && (
      !Number.isSafeInteger(contribution)
      || contribution < 1
      || contribution > amount
    )) {
      setError('Your planned contribution must be a whole amount no greater than your target.');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/dashboard/goals', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: goalName,
          targetAmount: amount,
          targetDate,
          planDurationDays: selectedDuration,
          plannedContributionAmount: contributionAmount ? contribution : null,
          plannedContributionFrequency: contributionAmount ? frequency.toLowerCase() : null,
        }),
      });
      const result = await response.json();
      if (response.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      if (!response.ok) throw new Error(result.message || 'We could not create this savings goal.');
      navigate('/dashboard', {
        replace: true,
        state: { goalNotice: `${result.goal.name} was created. Your contribution settings are a plan only; no money was moved.` },
      });
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'We could not reach GWIC. Check your connection and try again.'
        : requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="create-goal-page">
      <header className="create-goal-header">
        <Link aria-label="Back to dashboard" className="create-goal-back" to="/dashboard">
          <GoalIcon name="back" />
        </Link>
        <Link aria-label="GWIC home" className="create-goal-brand" to="/dashboard">
          <BrandMark className="create-goal-brand-mark" />
          <span><strong>GWIC</strong><small>GrowWithCore</small></span>
        </Link>
        <div className="create-goal-header-actions">
          <button aria-label="Notifications are not available yet" className="create-goal-header-icon" disabled type="button">
            <GoalIcon name="bell" />
          </button>
          <span aria-label="Your account" className="create-goal-profile"><GoalIcon name="user" /></span>
        </div>
      </header>

      <section className="create-goal-hero">
        <div>
          <h1>Create Savings Goal</h1>
          <p>Turn your dreams into achievable goals.<br />Save smarter, grow faster.</p>
        </div>
        <img alt="" className="create-goal-artwork" src={sproutCoins} />
      </section>

      <form className="create-goal-content" onSubmit={handleSubmit}>
        <section className="create-goal-section">
          <div className="create-goal-section-heading">
            <span aria-hidden="true" className="create-goal-step">1.</span>
            <div>
              <h2>Choose a Goal Template</h2>
              <p>Select a goal or create your own.</p>
            </div>
          </div>
          <div className="goal-template-grid">
            {templates.map((template) => (
              <button
                aria-pressed={selectedTemplate === template.id}
                className={`goal-template ${selectedTemplate === template.id ? 'is-selected' : ''}`}
                key={template.id}
                onClick={() => selectTemplate(template)}
                type="button"
              >
                <span className="goal-template-icon"><GoalIcon name={template.icon} /></span>
                <span>{template.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="create-goal-section create-goal-details">
          <div className="create-goal-section-heading">
            <span aria-hidden="true" className="create-goal-step">2.</span>
            <div>
              <h2>Set Your Goal Details</h2>
              <p>Choose a name, target amount, and date.</p>
            </div>
          </div>
          <label className="create-goal-field">
            Goal Name
            <span className="create-goal-name-input">
              <input
                autoComplete="off"
                maxLength="80"
                onChange={(event) => {
                  setGoalName(event.target.value);
                  if (event.target.value !== templates.find((template) => template.id === selectedTemplate)?.name) {
                    setSelectedTemplate('custom');
                  }
                }}
                placeholder="Give your goal a name"
                required
                value={goalName}
              />
              <span aria-hidden="true" className="create-goal-pencil"><GoalIcon name="edit" /></span>
            </span>
          </label>
          <div className="create-goal-field-grid">
            <label className="create-goal-field">
              Target Amount
              <span className="create-goal-currency-input">
                <span aria-hidden="true">₦</span>
                <input
                  inputMode="numeric"
                  min="1"
                  maxLength="15"
                  onChange={(event) => setTargetAmount(formatAmountInput(event.target.value))}
                  placeholder="500,000"
                  required
                  type="text"
                  value={targetAmount}
                />
              </span>
            </label>
            <label className="create-goal-field">
              Target date
              <span className="create-goal-input-icon">
                <GoalIcon name="calendar" />
                <input
                  min={minimumDate}
                  onChange={(event) => setTargetDate(event.target.value)}
                  required
                  type="date"
                  value={targetDate}
                />
              </span>
            </label>
          </div>
        </section>

        <section className="create-goal-section">
          <div className="create-goal-section-heading">
            <span aria-hidden="true" className="create-goal-step">3.</span>
            <div>
              <h2>Select Savings Plan</h2>
              <p>Choose how you want to save for this goal.</p>
            </div>
          </div>
          <div aria-label="Planning timeline" className="goal-duration-grid">
            {durations.map((days) => (
              <button
                aria-pressed={selectedDuration === days}
                className={`goal-duration ${selectedDuration === days ? 'is-selected' : ''}`}
                key={days}
                onClick={() => setDurationDays(days)}
                type="button"
              >
                <strong>{days} Days</strong>
                <small>Planning only</small>
              </button>
            ))}
          </div>
          <p className="create-goal-disclosure">Planning timeline only; no interest or investment return is applied.</p>
        </section>

        <section className="create-goal-section">
          <div className="create-goal-section-heading">
            <span aria-hidden="true" className="create-goal-step">4.</span>
            <div>
              <h2>Set Contributions</h2>
              <p>Plan how much and how often you’ll contribute.</p>
            </div>
          </div>
          <div className="create-goal-contribution">
            <span className="create-goal-contribution-icon"><GoalIcon name="calendar" /></span>
            <label className="create-goal-field">
              Contribution Amount
              <span className="create-goal-currency-input">
                <span aria-hidden="true">₦</span>
                <input
                  inputMode="numeric"
                  maxLength="15"
                  onChange={(event) => setContributionAmount(formatAmountInput(event.target.value))}
                  placeholder="Optional"
                  type="text"
                  value={contributionAmount}
                />
              </span>
            </label>
            <label className="create-goal-field">
              Frequency
              <select onChange={(event) => setFrequency(event.target.value)} value={frequency}>
                {frequencies.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>
          <p className="create-goal-disclosure">Contributions are manual. GWIC will not automatically debit your wallet.</p>
        </section>

        <section aria-label="Goal summary" className="create-goal-summary">
          <span className="create-goal-summary-icon"><GoalIcon name="target" /></span>
          <div className="create-goal-summary-content">
            <h2>Your goal summary</h2>
            <div className="create-goal-summary-grid">
              <div><span>Target amount</span><strong>{targetAmount ? formatMoney(amount) : '—'}</strong></div>
              <div><span>Duration</span><strong>{selectedDuration} Days</strong></div>
              <div><span>Target date</span><strong>{targetDate ? new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${targetDate}T00:00:00`)) : '—'}</strong></div>
            </div>
          </div>
        </section>

        {error && <p className="create-goal-error" role="alert">{error}</p>}
        <button className="create-goal-submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating your goal…' : 'Create goal'}
          {!isSubmitting && <GoalIcon name="arrow" />}
        </button>
        <p className="create-goal-footer-note">Creating a goal does not move money from your wallet.</p>
      </form>

      <nav aria-label="Main navigation" className="create-goal-mobile-nav">
        <Link to="/dashboard"><GoalIcon name="home" /><span>Home</span></Link>
        <Link to="/core-lock"><GoalIcon name="lock" /><span>Core Lock</span></Link>
        <Link to="/dashboard#account-balances"><GoalIcon name="invest" /><span>Invest</span></Link>
        <Link to="/activity"><GoalIcon name="calendar" /><span>Portfolio</span></Link>
        <Link to="/more"><GoalIcon name="more" /><span>More</span></Link>
      </nav>
    </main>
  );
}

export default CreateGoal;
