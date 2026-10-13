import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { AuthLoading, AuthStatusError } from '../pages/AuthPages';

export function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <AuthLoading />;
  if (status === 'error') return <AuthStatusError />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return children;
}

export function GuestRoute({ children }) {
  const { status } = useAuth();
  if (status === 'loading') return <AuthLoading />;
  if (status === 'error') return <AuthStatusError />;
  if (status === 'authenticated') return <Navigate to="/profile" replace />;
  return children;
}
