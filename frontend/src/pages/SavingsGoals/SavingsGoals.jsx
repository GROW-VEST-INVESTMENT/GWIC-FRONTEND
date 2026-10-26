import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SavingsGoals.css';

function formatMoney(amount, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function SavingsGoals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [currency, setCurrency] = useState('NGN');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadGoals() {
      try {
        const response = await fetch('/api/dashboard', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (response.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(result?.message || 'We could not load your savings goals.');
        }
        if (isActive) {
          setGoals(result.savingsGoals || []);
          setCurrency(result.balances?.currency || 'NGN');
          setError('');
        }
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

    loadGoals();
    return () => {
      isActive = false;
    };
  }, [navigate, retryKey]);

  return (
    <main className="savings-goals-page">
      <header className="savings-goals-header">
        <Link className="savings-goals-back" to="/dashboard">← Dashboard</Link>
        <Link className="savings-goals-create" to="/create-goal">Create goal</Link>
      </header>

      <section className="savings-goals-content" aria-labelledby="savings-goals-title">
        <div className="savings-goals-intro">
          <span>Your savings</span>
          <h1 id="savings-goals-title">All savings goals</h1>
          <p>Review every goal and its current progress. Goal amounts are planning information; they do not represent money locked in Core Lock.</p>
        </div>

        {isLoading && <p className="savings-goals-state">Loading your savings goals…</p>}

        {!isLoading && error && (
          <div className="savings-goals-state is-error" role="alert">
            <p>{error}</p>
            <button onClick={() => { setIsLoading(true); setRetryKey((key) => key + 1); }} type="button">
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && goals.length === 0 && (
          <div className="savings-goals-empty">
            <h2>No savings goals yet</h2>
            <p>Create your first goal to start planning your savings.</p>
            <Link className="savings-goals-create" to="/create-goal">Create a savings goal</Link>
          </div>
        )}

        {!isLoading && !error && goals.length > 0 && (
          <div className="savings-goals-list">
            <p className="savings-goals-count">{goals.length} {goals.length === 1 ? 'goal' : 'goals'}</p>
            {goals.map((goal) => (
              <article className="savings-goal-card" key={goal.id}>
                <div className="savings-goal-card-heading">
                  <div>
                    <h2>{goal.name}</h2>
                    <p>{goal.targetDate ? `Target date: ${formatDate(goal.targetDate)}` : 'No target date set'}</p>
                  </div>
                  <strong>{goal.progress}%</strong>
                </div>
                <div className="savings-goal-progress" aria-label={`${goal.progress}% complete`}>
                  <span style={{ width: `${goal.progress}%` }} />
                </div>
                <div className="savings-goal-amounts">
                  <span>Saved <strong>{formatMoney(goal.savedAmount, currency)}</strong></span>
                  <span>Target <strong>{formatMoney(goal.targetAmount, currency)}</strong></span>
                </div>
                {(goal.planDurationDays || goal.plannedContributionAmount) && (
                  <p className="savings-goal-plan">
                    {goal.planDurationDays ? `${goal.planDurationDays}-day plan` : ''}
                    {goal.planDurationDays && goal.plannedContributionAmount ? ' · ' : ''}
                    {goal.plannedContributionAmount
                      ? `${formatMoney(goal.plannedContributionAmount, currency)} ${goal.plannedContributionFrequency || ''}`
                      : ''}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default SavingsGoals;
