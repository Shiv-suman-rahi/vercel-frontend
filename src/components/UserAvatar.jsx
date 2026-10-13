const AVATAR_PRESETS = [
  { id: 'fox', name: 'Fox', emoji: '🦊' },
  { id: 'panda', name: 'Panda', emoji: '🐼' },
  { id: 'cat', name: 'Cat', emoji: '🐱' },
  { id: 'frog', name: 'Frog', emoji: '🐸' },
  { id: 'tiger', name: 'Tiger', emoji: '🐯' },
  { id: 'koala', name: 'Koala', emoji: '🐨' },
  { id: 'octopus', name: 'Octopus', emoji: '🐙' },
  { id: 'unicorn', name: 'Unicorn', emoji: '🦄' },
];

export { AVATAR_PRESETS };

export default function UserAvatar({
  avatarUrl,
  username = '',
  className = '',
  fallbackClassName = '',
  alt = '',
}) {
  const preset = AVATAR_PRESETS.find((item) => avatarUrl === `preset:${item.id}`);
  if (preset) {
    return (
      <span
        className={`${className} user-avatar-preset`}
        aria-label={alt || preset.name}
        aria-hidden={!alt}
        role={alt ? 'img' : undefined}
      >
        {preset.emoji}
      </span>
    );
  }

  if (avatarUrl) {
    return <img className={className} src={avatarUrl} alt={alt} />;
  }

  return (
    <span className={`${fallbackClassName || className} user-avatar-fallback`}>
      {username.charAt(0).toUpperCase() || 'U'}
    </span>
  );
}
