function BrandMark({ className = 'brand-mark' }) {
  return (
    <img
      src="/gwic-logo-v2.png"
      alt="GWIC logo"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}

export default BrandMark;