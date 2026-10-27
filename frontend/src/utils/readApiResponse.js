export async function readApiResponse(response, fallbackMessage) {
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(response.ok
      ? 'GWIC returned an unreadable response. Please try again.'
      : `${fallbackMessage} (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(result?.message || `${fallbackMessage} (HTTP ${response.status}).`);
  }

  return result;
}
