import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../services/api';
import AuthContext from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [status, setStatus] = useState('loading');
  const [authError, setAuthError] = useState('');

  const loadSession = useCallback(async () => {
    try {
      const response = await apiRequest('/api/auth/me');
      setUser(response.user);
      setCsrfToken(response.csrfToken);
      setStatus('authenticated');
    } catch (error) {
      setUser(null);
      setCsrfToken('');
      if (error.status === 401) {
        setStatus('unauthenticated');
      } else {
        setAuthError(error.message);
        setStatus('error');
      }
    }
  }, []);

  const refresh = useCallback(() => {
    setStatus('loading');
    setAuthError('');
    return loadSession();
  }, [loadSession]);

  useEffect(() => {
    void Promise.resolve().then(loadSession);
  }, [loadSession]);

  const authenticate = useCallback(async (endpoint, values) => {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(values),
    });
    setUser(response.user);
    setCsrfToken(response.csrfToken);
    setAuthError('');
    setStatus('authenticated');
    return response.user;
  }, []);

  const login = useCallback((values) => authenticate('/api/auth/login', values), [authenticate]);
  const requestSignupCode = useCallback((values) => apiRequest('/api/auth/register/request-code', {
    method: 'POST',
    body: JSON.stringify(values),
  }), []);
  const verifySignupCode = useCallback((values) => authenticate('/api/auth/register/verify', values), [authenticate]);

  const logout = useCallback(async () => {
    await apiRequest('/api/auth/logout', { method: 'POST', csrfToken });
    setUser(null);
    setCsrfToken('');
    setStatus('unauthenticated');
  }, [csrfToken]);

  const updateProfile = useCallback(async (values) => {
    const response = await apiRequest('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(values),
      csrfToken,
    });
    setUser(response.user);
    return response.user;
  }, [csrfToken]);

  const value = useMemo(() => ({
    user,
    csrfToken,
    status,
    authError,
    login,
    requestSignupCode,
    verifySignupCode,
    logout,
    refresh,
    updateProfile,
  }), [user, csrfToken, status, authError, login, requestSignupCode, verifySignupCode, logout, refresh, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
