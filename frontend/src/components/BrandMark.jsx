function BrandMark({ className = 'brand-mark' }) {
  return (
    <img
      src="/gwic-logo.png"
      alt="GWIC logo"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}

export default BrandMark;