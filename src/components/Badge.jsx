export default function Badge({ role }) {
  const config = {
    HOST: { label: 'HOST', icon: '👑', tone: 'host' },
    MODERATOR: { label: 'MODERATOR', icon: '🛡', tone: 'moderator' },
    PARTICIPANT: { label: 'PARTICIPANT', icon: '👤', tone: 'participant' },
  };

  const details = config[role] || config.PARTICIPANT;

  return <span className={`badge badge-${details.tone}`}>{details.icon} {details.label}</span>;
}
