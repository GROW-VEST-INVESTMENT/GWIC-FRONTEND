function isPrivateIPv4(hostname) {
  const parts = hostname.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  return parts[0] === 10
    || parts[0] === 127
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 192 && parts[1] === 168);
}

function isAllowedMobilePaymentCallback(value) {
  if (typeof value !== 'string' || value.length > 500) return false;

  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.username || url.password || url.search || url.hash) return false;

  if (url.protocol === 'gwic:') {
    return url.hostname === 'deposit-return' && ['', '/'].includes(url.pathname);
  }

  if (url.protocol === 'exp:') {
    const hostname = url.hostname.toLowerCase();
    const isExpoHost = hostname.endsWith('.exp.direct') || isPrivateIPv4(hostname);
    return isExpoHost && url.pathname === '/--/deposit-return';
  }

  return false;
}

module.exports = { isAllowedMobilePaymentCallback };
