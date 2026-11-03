import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import './Notifications.css';

const tabs = [
  { value: 'All', label: 'All' },
  { value: 'Unread', label: 'Unread' },
  { value: 'Transactions', label: 'Transactions' },
];

function NotificationIcon({ icon, color }) {
  const sharedProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `notification-item-icon notification-item-icon-${color}`,
    'aria-hidden': 'true',
  };

  const iconMap = {
    chart: (
      <svg {...sharedProps}>
        <path d="M4 18h16" />
        <path d="M7 14l3-3 3 2 5-6" />
        <path d="M18 7h2v2" />
      </svg>
    ),
    download: (
      <svg {...sharedProps}>
        <path d="M12 3v11" />
        <path d="m8 19 4 4 4-4" />
        <path d="M5 21h14" />
      </svg>
    ),
    wallet: (
      <svg {...sharedProps}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3 9h15a3 3 0 0 1 3 3v1H17a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h4" />
      </svg>
    ),
    target: (
      <svg {...sharedProps}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      </svg>
    ),
    megaphone: (
      <svg {...sharedProps}>
        <path d="M3 11v2a2 2 0 0 0 2 2h2l7 4v-12l-7 4H5a2 2 0 0 0-2 2Z" />
        <path d="M17 8c2 1 3 2 3 4s-1 3-3 4" />
      </svg>
    ),
    shield: (
      <svg {...sharedProps}>
        <path d="M12 3 18 5v6c0 4.5-2.8 7.5-6 9-3.2-1.5-6-4.5-6-9V5l6-2Z" />
        <path d="m9.5 12 1.6 1.6 3.4-4" />
      </svg>
    ),
    gift: (
      <svg {...sharedProps}>
        <path d="M4 10h16v10H4z" />
        <path d="M12 10v10M4 14h16M12 10V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2m8 0V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2" />
      </svg>
    ),
  };

  return iconMap[icon] ?? iconMap.chart;
}

function Notifications() {
  const [activeTab, setActiveTab] = useState('All');
  const [items, setItems] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  function markNotificationAsRead(id) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, unread: false } : item
      )
    );

    setSelectedNotification((currentSelection) =>
      currentSelection && currentSelection.id === id
        ? { ...currentSelection, unread: false }
        : currentSelection
    );
  }

  function handleNotificationSelect(item) {
    setSelectedNotification(item);
    if (item.unread !== false) {
      markNotificationAsRead(item.id);
    }
  }

  async function loadNotifications() {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      if (response.status === 401 || response.status === 403) {
        setItems([]);
        setError('');
        return;
      }

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || '');
      }

      const result = await response.json();
      const nextItems = (result.notifications || []).map((notification) => ({
        id: notification.id,
        category: notification.category || 'System',
        title: notification.title || 'GWIC Update',
        description: notification.message || 'A new update is waiting for you.',
        amount: notification.amount || '',
        time: notification.time || 'Just now',
        icon: notification.icon || 'chart',
        color: notification.color || 'green',
        unread: notification.unread !== false,
      }));

      setItems(nextItems);
      setError('');
    } catch (requestError) {
      const message = requestError?.message || '';
      setError(message);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    function handleNotification(event) {
      const detail = event.detail || {};
      const item = {
        id: String(Date.now() + Math.random()),
        category: detail.category || 'System',
        title: detail.title || 'GWIC Update',
        description: detail.message || 'A new update is waiting for you.',
        amount: detail.amount || '',
        time: detail.time || 'Just now',
        icon: detail.icon || 'chart',
        color: detail.color || 'green',
        unread: detail.unread !== false,
      };

      setItems((currentItems) => [item, ...currentItems]);
    }

    loadNotifications();
    window.addEventListener('gwic:notification', handleNotification);

    return () => {
      window.removeEventListener('gwic:notification', handleNotification);
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (activeTab === 'All') return items;
    if (activeTab === 'Unread') return items.filter((item) => item.unread !== false);
    if (activeTab === 'Transactions') {
      return items.filter((item) => item.category === 'Transactions' || item.category === 'Transaction');
    }
    return items.filter((item) => item.category === activeTab);
  }, [activeTab, items]);

  const notificationCount = items.length;
  const unreadCount = items.filter((item) => item.unread !== false).length;

  return (
    <div className="notifications-page-shell">
      <div className="notifications-phone-frame">
        <header className="notifications-hero">
          <div className="notifications-topbar">
            <div className="notifications-brand-wrap">
              <div className="notifications-brand-mark-wrap">
                <BrandMark className="notifications-brand-mark" />
              </div>
              <div className="notifications-brand-text-wrap">
                <h1>GWIC</h1>
                <span>GrowWithCore</span>
              </div>
            </div>

            <div className="notifications-header-actions">
              <button type="button" className="notifications-bell-button" aria-label="Notifications">
                <span className="notifications-bell">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                  </svg>
                </span>
                <span className="notifications-badge">{unreadCount}</span>
              </button>
            </div>
          </div>

          <div className="notifications-hero-copy">
            <h2>Notifications</h2>
            <p>Stay updated on your investments, savings and account activity.</p>
          </div>

        </header>

        <main className="notifications-body">
          <div className="notifications-tabs" role="tablist" aria-label="Notification categories">
            {tabs.map((tab) => {
              const isActive = tab.value === activeTab;
              const count = tab.value === 'All' ? notificationCount : tab.value === 'Unread' ? unreadCount : undefined;

              return (
                <button
                  key={tab.value}
                  type="button"
                  className={isActive ? 'notifications-tab active' : 'notifications-tab'}
                  onClick={() => setActiveTab(tab.value)}
                  aria-pressed={isActive}
                >
                  {count !== undefined ? `${tab.label} (${count})` : tab.label}
                </button>
              );
            })}
          </div>

          {selectedNotification ? (
            <div className="notification-detail-panel" aria-live="polite">
              <div className="notification-detail-header">
                <div className={`notification-icon-wrap notification-icon-wrap-${selectedNotification.color}`}>
                  <NotificationIcon icon={selectedNotification.icon} color={selectedNotification.color} />
                </div>
                <div className="notification-detail-copy">
                  <span className="notification-detail-label">{selectedNotification.category}</span>
                  <h3>{selectedNotification.title}</h3>
                </div>
                <button
                  type="button"
                  className="notification-detail-close"
                  onClick={() => setSelectedNotification(null)}
                  aria-label="Close notification detail"
                >
                  ×
                </button>
              </div>

              <div className="notification-detail-body">
                <p>{selectedNotification.description}</p>
                {selectedNotification.amount ? <strong>{selectedNotification.amount}</strong> : null}
                <time>{selectedNotification.time}</time>
              </div>
            </div>
          ) : null}

          {error && <p className="notifications-inline-error">{error}</p>}

          {isLoading ? (
            <div className="notifications-list notifications-skeleton-list" aria-live="polite" aria-label="Loading notifications">
              {[1, 2, 3].map((item) => (
                <div key={item} className="notification-skeleton-row">
                  <span className="notification-skeleton-icon" />
                  <div className="notification-skeleton-copy">
                    <span className="notification-skeleton-line short" />
                    <span className="notification-skeleton-line" />
                    <span className="notification-skeleton-line xshort" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="notifications-list notifications-list-empty">
              <div className="notifications-empty-state">
                <div className="notifications-empty-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                  </svg>
                </div>
                <strong>{activeTab === 'Unread' ? 'No unread notifications' : 'No notifications yet'}</strong>
                <p>
                  {activeTab === 'Unread'
                    ? 'You are all caught up. New updates will show here when they arrive.'
                    : 'New account updates, savings milestones, and payment alerts will appear here.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="notifications-list" aria-live="polite">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className={item.unread !== false ? 'notification-row unread' : 'notification-row'}
                  onClick={() => handleNotificationSelect(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleNotificationSelect(item);
                    }
                  }}
                >
                  <div className={`notification-icon-wrap notification-icon-wrap-${item.color}`}>
                    <NotificationIcon icon={item.icon} color={item.color} />
                  </div>

                  <div className="notification-content">
                    <div className="notification-main-line">
                      <h3>{item.title}</h3>
                      <div className="notification-meta-row">
                        {item.unread !== false ? <span className="notification-dot" aria-label="Unread notification" /> : null}
                        <span className="notification-chevron" aria-hidden="true">›</span>
                      </div>
                    </div>

                    <p>
                      {item.description}
                      {item.amount ? <span className="notification-amount"> {item.amount}</span> : null}
                    </p>

                    <time>{item.time}</time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        <nav className="notifications-bottom-nav" aria-label="Mobile dashboard navigation">
          <Link to="/dashboard" className="nav-item">
            <svg aria-hidden="true" className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="m2.5 11.2 9.5-8 9.5 8h-2v9.3h-5.3v-6.1H10v6.1H4.7v-9.3h-2.2Z" fill="currentColor" stroke="none" />
              <path d="m2.5 11.2 9.5-8 9.5 8" strokeWidth="2.2" />
            </svg>
            <span>Home</span>
          </Link>
          <Link to="/core-lock" className="nav-item">
            <svg aria-hidden="true" className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4.5" y="10" width="15" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
            </svg>
            <span>Core Lock</span>
          </Link>
          <Link to="/invest" className="nav-item">
            <svg aria-hidden="true" className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 20.5h18M5.5 18v-5h3v5m3 0V9h3v9m3 0V5h3v13" />
              <path d="m5 9 5-4 4 2 6-5m-5 0h5v5" />
            </svg>
            <span>Invest</span>
          </Link>
          <Link to="/portfolio" className="nav-item">
            <svg aria-hidden="true" className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="5" width="16" height="16" rx="2" />
              <path d="M8 3v4m8-4v4M8 16h2l2-3 2 2 3-4m-3 0h3v3" />
            </svg>
            <span>Portfolio</span>
          </Link>
          <Link to="/more" className="nav-item active">
            <svg aria-hidden="true" className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 6h17M3.5 12h17M3.5 18h17" strokeWidth="2.4" />
            </svg>
            <span>More</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default Notifications;
