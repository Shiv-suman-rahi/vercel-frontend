import { apiUrl } from '../config';

export async function apiRequest(path, { csrfToken, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (csrfToken) headers.set('X-CSRF-Token', csrfToken);

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = response.status === 401
      ? 'Your sign-in session has expired. Please log in again.'
      : payload.message || 'The request could not be completed.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return payload;
}
