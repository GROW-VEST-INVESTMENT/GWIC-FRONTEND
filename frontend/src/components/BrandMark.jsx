function BrandMark({ className = 'brand-mark' }) {
  return (
    <svg className={className} viewBox="0 0 56 56" aria-hidden="true">
      <path d="M7 42V24l12-12 7 8L40 7l9 2-2 10-15 15-8-7-9 9v6H7Z" fill="currentColor" />
      <path d="M13 45h7V32l-7 7v6Zm12 0h7V27l-7 7v11Zm12 0h7V20l-7 7v18Z" fill="currentColor" />
      <path d="m30 17 7-7 6 6-7 7-6-6Z" fill="#a8ed43" />
    </svg>
  );
}

export default BrandMark;