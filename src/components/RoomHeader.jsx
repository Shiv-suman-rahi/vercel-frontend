import ConnectionStatus from './ConnectionStatus';

export default function RoomHeader({ roomId, connectionStatus, onCopyLink, onLeaveRoom, isHost, onCloseRoom }) {
  return (
    <header className="room-header">
      <div className="room-header__title-wrap">
        <div className="brand-lockup">
          <span className="brand-mark">▶</span>
          <div>
            <span className="eyebrow">WATCH TOGETHER • STAY IN SYNC</span>
            <h1>YouTube Watch Party</h1>
            <p className="room-header__subtitle">Room <strong>{roomId}</strong></p>
          </div>
        </div>
        {isHost && <span className="room-header__host-badge">★ HOST CONTROL</span>}
      </div>
      <div className="room-header__actions">
        <ConnectionStatus status={connectionStatus} />
        <button type="button" className="secondary-btn" onClick={onCopyLink}>Copy Invite Link</button>
        {isHost && <button type="button" className="close-room-btn" onClick={onCloseRoom}>Close Room</button>}
        <button type="button" className="ghost-btn" onClick={onLeaveRoom}>Leave Room</button>
      </div>
    </header>
  );
}
