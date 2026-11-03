import { useEffect, useState } from 'react';

const defaultToasts = [];

function getTypeClass(type) {
  switch (type) {
    case 'success':
      return 'gwic-toast gwic-toast-success';
    case 'error':
      return 'gwic-toast gwic-toast-error';
    case 'warning':
      return 'gwic-toast gwic-toast-warning';
    default:
      return 'gwic-toast gwic-toast-info';
  }
}

export default function GlobalNotificationCenter() {
  const [toasts, setToasts] = useState(defaultToasts);

  useEffect(() => {
    const handleNotification = (event) => {
      const { title, message, type, duration } = event.detail;
      const id = Date.now() + Math.random();

      setToasts((currentToasts) => [
        ...currentToasts,
        {
          id,
          title,
          message,
          type,
        },
      ]);

      window.setTimeout(() => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
      }, duration || 5000);
    };

    window.addEventListener('gwic:notification', handleNotification);

    return () => {
      window.removeEventListener('gwic:notification', handleNotification);
    };
  }, []);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="gwic-toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={getTypeClass(toast.type)} role="status">
          <div className="gwic-toast-icon" aria-hidden="true">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : toast.type === 'warning' ? '⚠' : 'i'}
          </div>

          <div className="gwic-toast-content">
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
