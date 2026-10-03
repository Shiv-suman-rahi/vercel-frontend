export default function Badge({ role }) {
  const normalizedRole = String(role || '').trim().toLowerCase();
  const config = {
    host: { label: 'HOST', icon: '👑', tone: 'host' },
    moderator: { label: 'MODERATOR', icon: '🛡', tone: 'moderator' },
    participant: { label: 'PARTICIPANT', icon: '👤', tone: 'participant' },
  };

  const details = config[normalizedRole] || config.participant;

  return <span className={`badge badge-${details.tone}`}>{details.icon} {details.label}</span>;
}
