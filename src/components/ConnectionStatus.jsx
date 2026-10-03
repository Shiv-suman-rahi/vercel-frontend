export default function ConnectionStatus({ status }) {
  const labels = {
    connected: 'Connected',
    connecting: 'Connecting',
    reconnecting: 'Reconnecting',
    disconnected: 'Disconnected',
  };

  return (
    <div className={`connection-status connection-status--${status}`}>
      <span className="status-dot" aria-hidden="true" />
      <span>{labels[status] || labels.connected}</span>
    </div>
  );
}
