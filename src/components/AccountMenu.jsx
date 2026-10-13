import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import { useAuth } from '../context/useAuth';

export default function AccountMenu() {
  const { user } = useAuth();

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
        <UserAvatar avatarUrl={user.avatarUrl} username={user.username} className="account-menu-avatar" />
        <strong>{user.username}</strong>
      </Link>
    </div>
  );
}
