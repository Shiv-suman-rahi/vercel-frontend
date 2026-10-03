import ConnectionStatus from './ConnectionStatus';

export default function RoomHeader({ roomId, connectionStatus, onCopyLink, onLeaveRoom }) {
  return (
    <header className="room-header">
      <div className="room-header__title-wrap">
        <div className="brand-lockup">
          <span className="brand-mark">▶</span>
          <div>
            <span className="eyebrow">Watch Party</span>
            <h1>Room: {roomId}</h1>
          </div>
        </div>
      </div>
      <div className="room-header__actions">
        <ConnectionStatus status={connectionStatus} />
        <button type="button" className="secondary-btn" onClick={onCopyLink}>Copy Invite Link</button>
        <button type="button" className="ghost-btn" onClick={onLeaveRoom}>Leave Room</button>
      </div>
    </header>
  );
}
