import { apiUrl } from '../config';

export async function apiRequest(path, { csrfToken, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (csrfToken) headers.set('X-CSRF-Token', csrfToken);

  let response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new Error('Unable to reach the Watch Party server. Check your connection and try again.');
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : {};
  if (!response.ok) {
    let message = payload.message;
    if (response.status === 401) {
      message = 'Your sign-in session has expired. Please log in again.';
    } else if (!message && (response.status === 404 || response.status === 405)) {
      message = 'This API route is not available on the backend. Deploy the latest backend version and try again.';
    } else if (!message && response.status >= 500) {
      message = 'The backend could not process this request. Check the Render service logs for details.';
    } else if (!message) {
      message = `The request failed (HTTP ${response.status}). Please try again.`;
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return payload;
}
