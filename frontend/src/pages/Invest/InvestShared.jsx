const iconPaths = {
  back: <path d="m15 18-6-6 6-6M9 12h12" />,
  user: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  invest: <><path d="M3 20h18M5 17v-5h3v5m3 0V9h3v8m3 0V5h3v12" /><path d="m5 9 5-4 4 2 6-5" /></>,
  portfolio: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M8 16h2l2-3 2 2 3-4" /></>,
  more: <path d="M3 6h18M3 12h18M3 18h18" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 9h18m-5 5h2" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></>,
  chart: <><path d="M3 19h18M4 16l5-5 4 3 7-8" /><path d="M15 6h5v5" /></>,
  shield: <><path d="M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18" /></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  plus: <path d="M12 5v14m-7-7h14" />,
  down: <path d="M12 4v15m-6-6 6 6 6-6" />,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  sliders: <><path d="M4 7h16M4 12h16M4 17h16" /><circle cx="8" cy="7" r="2" fill="currentColor" /><circle cx="15" cy="12" r="2" fill="currentColor" /><circle cx="10" cy="17" r="2" fill="currentColor" /></>,
};

export function Icon({ name }) {
  return (
    <svg aria-hidden="true" className={`invest-icon is-${name}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {iconPaths[name]}
    </svg>
  );
}
