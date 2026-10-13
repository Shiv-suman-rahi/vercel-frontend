import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function handleLogout() {
    setError('');
    try {
      await logout();
      navigate('/', { state: { notice: 'You have been signed out.' } });
    } catch (logoutError) {
      setError(logoutError.message);
    }
  }

  if (!user) {
    return (
      <div className="account-menu">
        <Link to="/login">Log in</Link>
        <Link className="primary-btn" to="/signup">Sign up</Link>
      </div>
    );
  }

  return (
    <div className="account-menu">
      <Link className="account-profile-link" to="/profile" aria-label={`Profile for ${user.username}`}>
        {user.avatarUrl
          ? <img src={user.avatarUrl} alt="" />
          : <span>{user.username.charAt(0).toUpperCase()}</span>}
        <strong>{user.username}</strong>
      </Link>
      <button type="button" className="ghost-btn account-logout" onClick={handleLogout}>Log out</button>
      {error && <span className="account-menu-error" role="alert">{error}</span>}
    </div>
  );
}
