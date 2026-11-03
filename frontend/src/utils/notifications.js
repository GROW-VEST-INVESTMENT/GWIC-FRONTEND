const DEFAULT_DURATION = 5000;

function getNotificationSoundEnabled() {
  if (typeof window === 'undefined') return true;

  const storedValue = window.localStorage.getItem('gwic-notification-sound');
  if (storedValue === null) return true;

  return storedValue === 'true';
}

export function setNotificationSoundEnabled(enabled) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('gwic-notification-sound', String(Boolean(enabled)));
}

export function playNotificationSound() {
  if (typeof window === 'undefined' || !getNotificationSoundEnabled()) {
    return;
  }

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    return;
  }

  try {
    const context = new AudioContextCtor();
    const startAt = context.currentTime;
    const masterGain = context.createGain();
    masterGain.gain.setValueAtTime(0.0001, startAt);
    masterGain.gain.exponentialRampToValueAtTime(1.8, startAt + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startAt + 1.35);
    masterGain.connect(context.destination);

    if (context.state === 'suspended') {
      context.resume().catch(() => undefined);
    }

    const notes = [1180, 1460, 1880, 2240, 2560, 2920];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const offset = index * 0.11;

      oscillator.type = index % 2 === 0 ? 'sawtooth' : 'square';
      oscillator.frequency.setValueAtTime(frequency, startAt + offset);

      gainNode.gain.setValueAtTime(0.0001, startAt + offset);
      gainNode.gain.exponentialRampToValueAtTime(1.9, startAt + offset + 0.025);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + offset + 0.18);

      oscillator.connect(gainNode);
      gainNode.connect(masterGain);

      oscillator.start(startAt + offset);
      oscillator.stop(startAt + offset + 0.22);
    });

    window.setTimeout(() => {
      context.close().catch(() => undefined);
    }, 1800);
  } catch (_error) {
    // Browsers can block Web Audio unless the user interacts with the page first.
  }
}

export function notifyUser({
  title,
  message,
  type = 'info',
  duration = DEFAULT_DURATION,
  requireBrowserPermission = false,
} = {}) {
  if (typeof window === 'undefined') return;

  const event = new window.CustomEvent('gwic:notification', {
    detail: {
      title: title || 'GWIC update',
      message: message || 'You have a new notification.',
      type,
      duration,
    },
  });

  window.dispatchEvent(event);
  playNotificationSound();

  if (
    requireBrowserPermission &&
    'Notification' in window &&
    Notification.permission === 'granted' &&
    title
  ) {
    new Notification(title, {
      body: message,
      silent: true,
    });
  }
}

export function requestBrowserNotificationPermission() {
  if (!('Notification' in window)) {
    return Promise.resolve('unsupported');
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve('granted');
  }

  if (Notification.permission === 'denied') {
    return Promise.resolve('denied');
  }

  return Notification.requestPermission();
}

export function attachNotificationListener(listener) {
  if (typeof window === 'undefined') return () => undefined;

  const handler = (event) => {
    listener(event.detail);
  };

  window.addEventListener('gwic:notification', handler);

  return () => {
    window.removeEventListener('gwic:notification', handler);
  };
}
