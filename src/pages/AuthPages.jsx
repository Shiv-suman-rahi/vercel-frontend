import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AccountMenu from '../components/AccountMenu';
import { useAuth } from '../context/useAuth';

function BrandNav() {
  return (
    <nav className="top-nav auth-top-nav">
      <Link className="brand" to="/">
        <span className="brand-mark">▶</span>
        <span>YouTube <strong>Watch Party</strong></span>
      </Link>
      <AccountMenu />
    </nav>
  );
}

function AuthFrame({ eyebrow, title, children, footer }) {
  return (
    <div className="page-shell auth-page">
      <BrandNav />
      <main className="centered-shell">
        <section className="card form-card auth-card">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {children}
          {footer && <p className="auth-footer">{footer}</p>}
        </section>
      </main>
    </div>
  );
}

export function AuthLoading() {
  return <div className="page-shell auth-loading" role="status">Checking your account…</div>;
}

export function AuthStatusError() {
  const { authError, refresh } = useAuth();
  return (
    <div className="page-shell auth-loading">
      <p role="alert">{authError || 'Unable to check your session.'}</p>
      <button type="button" className="primary-btn" onClick={refresh}>Try again</button>
    </div>
  );
}

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (status === 'authenticated') return <Navigate to="/profile" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate(location.state?.from || '/profile', {
        replace: true,
        state: { notice: 'You are signed in.' },
      });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame
      eyebrow="Welcome back"
      title="Log in to your account"
      footer={<>New to Watch Party? <Link to="/signup">Create an account</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label htmlFor="login-password">Password</label>
        <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </button>
      </form>
    </AuthFrame>
  );
}

export function SignUpPage() {
  const { register, status } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (status === 'authenticated') return <Navigate to="/profile" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (username.trim().length < 2 || username.trim().length > 30) {
      setError('Username must be between 2 and 30 characters.');
      return;
    }
    if (password.length < 10 || password.length > 128) {
      setError('Password must be between 10 and 128 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({ username: username.trim(), email: email.trim(), password });
      navigate('/profile', { replace: true, state: { notice: 'Your account has been created.' } });
    } catch (signupError) {
      setError(signupError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame
      eyebrow="Start watching together"
      title="Create your account"
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="signup-username">Username</label>
        <input id="signup-username" type="text" autoComplete="username" minLength="2" maxLength="30" value={username} onChange={(event) => setUsername(event.target.value)} required />
        <label htmlFor="signup-email">Email</label>
        <input id="signup-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label htmlFor="signup-password">Password</label>
        <input id="signup-password" type="password" autoComplete="new-password" minLength="10" maxLength="128" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <label htmlFor="signup-confirm-password">Confirm password</label>
        <input id="signup-confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    </AuthFrame>
  );
}

export function UserProfilePage() {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState(user.username);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setNotice('');
    setAvatarLoading(true);
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Choose a JPG, PNG, or WebP image.');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Choose an image smaller than 10 MB.');
      }

      const image = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      const size = 256;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('This browser cannot process the selected image.');

      const cropSize = Math.min(image.width, image.height);
      context.drawImage(
        image,
        (image.width - cropSize) / 2,
        (image.height - cropSize) / 2,
        cropSize,
        cropSize,
        0,
        0,
        size,
        size,
      );
      image.close();

      let dataUrl = canvas.toDataURL('image/webp', 0.82);
      if (!dataUrl.startsWith('data:image/webp;')) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      }
      if (dataUrl.length > 240 * 1024) {
        throw new Error('This image could not be compressed small enough. Please choose another image.');
      }
      setAvatarUrl(dataUrl);
    } catch (avatarError) {
      setError(avatarError.message || 'Unable to use that image.');
    } finally {
      setAvatarLoading(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const updatedUser = await updateProfile({ username: username.trim(), avatarUrl: avatarUrl.trim() });
      setUsername(updatedUser.username);
      setAvatarUrl(updatedUser.avatarUrl);
      setNotice('Your profile has been updated.');
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell auth-page">
      <BrandNav />
      <main className="profile-layout">
        <section className="card form-card profile-card">
          <p className="eyebrow">Your account</p>
          <h1>Profile</h1>
          <div className="profile-summary">
            {avatarUrl
              ? <img src={avatarUrl} alt={`${user.username}'s avatar`} />
              : <span className="profile-avatar-fallback">{user.username.charAt(0).toUpperCase()}</span>}
            <div>
              <strong>{user.username}</strong>
              <span>{user.email}</span>
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="profile-username">Username</label>
            <input id="profile-username" type="text" minLength="2" maxLength="30" value={username} onChange={(event) => setUsername(event.target.value)} required />
            <label htmlFor="profile-avatar">Profile photo <span>(optional, JPG, PNG, or WebP)</span></label>
            <div className="profile-avatar-upload">
              <input
                id="profile-avatar"
                className="profile-avatar-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={avatarLoading || loading}
              />
              <label className="profile-avatar-picker" htmlFor="profile-avatar">
                {avatarLoading ? 'Preparing image…' : 'Choose image'}
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setAvatarUrl('')}
                  disabled={avatarLoading || loading}
                >
                  Remove photo
                </button>
              )}
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            {notice && <p className="form-success" role="status">{notice}</p>}
            <button type="submit" className="primary-btn" disabled={loading || avatarLoading}>
              {loading ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
