import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { buildRoomLink, createRoomRequest } from './services/socketService';
import { extractYouTubeVideoId, formatTime } from './utils/youtube';
import RoomHeader from './components/RoomHeader';
import ParticipantList from './components/ParticipantList';
import RoomChat from './components/RoomChat';
import YouTubePlayer from './components/YouTubePlayer';
import Toast from './components/Toast';
import Badge from './components/Badge';
import { backendUrl } from './config';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page-shell home-page">
      <nav className="top-nav">
        <a className="brand" href="/" aria-label="YouTube Watch Party home">
          <span className="brand-mark">▶</span>
          <span>YouTube <strong>Watch Party</strong></span>
        </a>
        <div className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <button type="button" className="secondary-btn" onClick={() => navigate('/join-room')}>Join Room</button>
          <button type="button" className="primary-btn" onClick={() => navigate('/create-room')}>Create Room</button>
        </div>
      </nav>

      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow"><span className="hero-sparkle">✦</span> Real-time co-watching</p>
          <h1>YouTube<br /><span>Watch Party</span></h1>
          <p className="lede">
            Create a room, invite your friends, and watch your favorite videos together — wherever everyone is.
          </p>
          <div className="cta-row">
            <button type="button" className="primary-btn" onClick={() => navigate('/create-room')}>
              <span aria-hidden="true">✦</span> Create a Room
            </button>
            <button type="button" className="secondary-btn" onClick={() => navigate('/join-room')}>
              <span aria-hidden="true">↗</span> Join a Room
            </button>
          </div>
          <div className="home-social-proof">
            <div className="home-avatar-stack" aria-hidden="true">
              <span>J</span><span>M</span><span>A</span><span>K</span>
            </div>
            <p><strong>Good videos are better together.</strong><br />Bring your favorite people along.</p>
          </div>
        </div>

        <div className="hero-visual" aria-label="Watch party preview">
          <span className="preview-float preview-float--spark" aria-hidden="true">✦</span>
          <span className="preview-float preview-float--tag">You’re together!</span>
          <div className="preview-window">
            <div className="preview-header">
              <span className="preview-brand-mark">▶</span>
              <strong>YouTube</strong>
              <span className="preview-window-dots"><i /><i /><i /></span>
            </div>
            <div className="preview-body">
              <div className="preview-video" aria-label="Video preview with play button">
                <span className="preview-video-label">WATCH PARTY • LIVE</span>
                <span className="preview-video-controls"><i /><i /><i /></span>
              </div>
              <div className="preview-chat">
                <p className="preview-chat-title">PARTY MEMBERS <span>4</span></p>
                <div className="preview-user"><span className="preview-user-avatar preview-user-avatar--pink">S</span><span>Shiv</span><i /></div>
                <div className="preview-user"><span className="preview-user-avatar preview-user-avatar--teal">R</span><span>Rahul</span><i /></div>
                <div className="preview-user"><span className="preview-user-avatar preview-user-avatar--gold">A</span><span>Aman</span><i /></div>
                <div className="preview-user"><span className="preview-user-avatar preview-user-avatar--purple">M</span><span>Maya</span><i /></div>
              </div>
            </div>
            <div className="preview-reactions" aria-hidden="true"><span>😊</span><span>❤️</span><span>🙌</span><span>😂</span></div>
          </div>
        </div>
      </section>

      <section className="features-grid" id="features" aria-label="Watch Party features">
        {[
          ['⚡', 'Real-Time Sync', 'Everyone watches in perfect sync.', 'violet'],
          ['🏠', 'Room Based', 'Your own private watch space.', 'teal'],
          ['▶', 'YouTube Powered', 'All your favorite videos, together.', 'rose'],
          ['🛡', 'Role-Based Access', 'Host controls keep it simple.', 'blue'],
        ].map(([icon, title, text, tone]) => (
          <article className={`feature-card feature-card--${tone}`} key={title}>
            <div className="feature-icon" aria-hidden="true">{icon}</div>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </section>
      <section className="home-how-it-works" id="how-it-works">
        <p className="eyebrow">Three easy steps</p>
        <h2>Pick a video. Invite your people. Press play.</h2>
      </section>
    </div>
  );
}

function CreateRoomPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreateRoom(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = await createRoomRequest(name.trim());
      localStorage.setItem('watchPartyName', name.trim());
      localStorage.setItem('watchPartyUserId', payload.userId);
      navigate(`/room/${payload.roomId}`);
    } catch (err) {
      setError(err.message || 'Unable to create room.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell centered-shell">
      <form className="card form-card" onSubmit={handleCreateRoom}>
        <p className="eyebrow">Create Watch Party</p>
        <h2>Create a room</h2>

        <label htmlFor="name">Your Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter your name"
          required
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Creating Room...' : 'Create Room'}
        </button>
      </form>
    </div>
  );
}

function JoinRoomPage() {
  const navigate = useNavigate();
  const { roomId: routeRoomId } = useParams();
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState(routeRoomId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (routeRoomId) {
      setRoomId(routeRoomId.toUpperCase());
    }
  }, [routeRoomId]);

  function handleJoinRoom(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!roomId.trim()) {
      setError('Please enter a room code.');
      return;
    }

    const finalRoomId = roomId.trim().toUpperCase();
    localStorage.setItem('watchPartyName', name.trim());
    setLoading(true);
    setError('');
    navigate(`/room/${finalRoomId}`);
  }

  return (
    <div className="page-shell centered-shell">
      <form className="card form-card" onSubmit={handleJoinRoom}>
        <p className="eyebrow">Join Watch Party</p>
        <h2>Enter the room</h2>

        <label htmlFor="join-name">Your Name</label>
        <input id="join-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required />

        <label htmlFor="room-code">Room Code</label>
        <input id="room-code" type="text" value={roomId} onChange={(event) => setRoomId(event.target.value.toUpperCase())} placeholder="ABX729" required />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Joining Room...' : 'Join Room'}
        </button>
      </form>
    </div>
  );
}

function WatchPartyPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [player, setPlayer] = useState(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);
  const [status, setStatus] = useState('connecting');
  const [toastQueue, setToastQueue] = useState([]);
  const [draftVideoUrl, setDraftVideoUrl] = useState('');
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('watchPartyUserId') || null);
  const [currentRole, setCurrentRole] = useState('participant');
  const [roomError, setRoomError] = useState('');
  const [roomClosed, setRoomClosed] = useState(false);
  const [closedByCurrentUser, setClosedByCurrentUser] = useState(false);
  const [removedFromRoom, setRemovedFromRoom] = useState(false);
  const [rejoinPending, setRejoinPending] = useState(false);
  const [rejoinRequests, setRejoinRequests] = useState([]);
  const [hostLeavePrompt, setHostLeavePrompt] = useState(false);
  const [promotionTargetId, setPromotionTargetId] = useState('');
  const isRemoteUpdateRef = useRef(false);
  const lastReportedPlaybackTimeRef = useRef(0);

  const pushToast = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToastQueue((old) => [...old, { id, message, type }]);
    setTimeout(() => {
      setToastQueue((old) => old.filter((toast) => toast.id !== id));
    }, 3000);
  };

  useEffect(() => {
    if (!roomId) {
      navigate('/join-room');
      return undefined;
    }

    const roomSocket = io(backendUrl, { transports: ['websocket'], reconnection: true });
    setSocket(roomSocket);

    const storedName = localStorage.getItem('watchPartyName') || 'Guest';
    const storedUserId = localStorage.getItem('watchPartyUserId');

    roomSocket.on('connect', () => {
      setStatus('connected');
      roomSocket.emit('join_room', { roomId, username: storedName, userId: storedUserId || undefined });
    });
    roomSocket.on('disconnect', () => setStatus('disconnected'));
    roomSocket.on('connect_error', () => setStatus('reconnecting'));
    roomSocket.on('reconnect', () => setStatus('connected'));
    roomSocket.on('error', ({ message }) => {
      setRoomError(message || 'Something went wrong.');
      pushToast(message || 'Something went wrong.', 'error');
    });

    roomSocket.on('rejoin_pending', ({ message }) => {
      setRoomError('');
      setRejoinPending(true);
      pushToast(message || 'Your request to rejoin is waiting for host approval.', 'info');
    });

    roomSocket.on('rejoin_requests', (requests) => {
      setRejoinRequests(Array.isArray(requests) ? requests : []);
    });

    roomSocket.on('rejoin_request', (request) => {
      if (!request?.userId || !request?.username) return;
      setRejoinRequests((current) => (
        current.some((item) => item.userId === request.userId)
          ? current
          : [...current, request]
      ));
      pushToast(`${request.username} wants to rejoin the room.`, 'info');
    });

    roomSocket.on('rejoin_request_resolved', ({ userId }) => {
      setRejoinRequests((current) => current.filter((request) => request.userId !== userId));
    });

    roomSocket.on('room_left', () => navigate('/'));

    roomSocket.on('session', ({ userId, role }) => {
      setRoomError('');
      setRejoinPending(false);
      setCurrentUserId(userId);
      localStorage.setItem('watchPartyUserId', userId);
      setCurrentRole(String(role || '').trim().toLowerCase());
      pushToast(`Joined room ${roomId}`, 'success');
    });

    roomSocket.on('sync_state', (nextRoom) => {
      setRoom(nextRoom);
      setPlaybackTime(Number(nextRoom?.currentTime) || 0);
      if (nextRoom?.participants) {
        const me = nextRoom.participants.find((participant) => participant.userId === currentUserId || participant.userId === localStorage.getItem('watchPartyUserId'));
        if (me) {
          setCurrentRole(String(me.role || '').trim().toLowerCase());
        }
      }
    });

    roomSocket.on('chat_message', (message) => {
      if (!message || message.roomId !== roomId.trim().toUpperCase()) return;
      setChatMessages((messages) => [...messages, message].slice(-100));
    });

    roomSocket.on('chat_error', ({ message }) => {
      pushToast(message || 'Unable to send chat message.', 'error');
    });

    roomSocket.on('participants_updated', (participants) => {
      setRoom((currentRoom) => currentRoom ? { ...currentRoom, participants } : currentRoom);
    });

    roomSocket.on('role_assigned', ({ userId, role }) => {
      if (userId === currentUserId || userId === localStorage.getItem('watchPartyUserId')) {
        setCurrentRole(String(role || '').trim().toLowerCase());
      }
      pushToast(`Role updated to ${String(role || '').trim().toLowerCase()}`, 'success');
    });

    roomSocket.on('participant_removed', ({ username }) => {
      pushToast(`${username} was removed from the room.`, 'info');
    });

    roomSocket.on('removed_from_room', ({ message }) => {
      pushToast(message, 'error');
      setRemovedFromRoom(true);
      setRoom(null);
      roomSocket.disconnect();
    });

    roomSocket.on('user_left', ({ username }) => {
      pushToast(`${username} left the room.`, 'info');
    });

    roomSocket.on('user_offline', ({ username }) => {
      pushToast(`${username} went offline.`, 'info');
    });

    roomSocket.on('room_closed', ({ hostId, message }) => {
      const activeUserId = localStorage.getItem('watchPartyUserId');
      setClosedByCurrentUser(Boolean(hostId && hostId === activeUserId));
      setRoomClosed(true);
      setRoom(null);
      roomSocket.disconnect();
      pushToast(message || 'The host closed this watch party.', 'info');
    });

    return () => roomSocket.disconnect();
  }, [navigate, roomId]);

  const participantList = room?.participants || [];
  const currentParticipant = participantList.find((participant) => participant.userId === currentUserId || participant.userId === localStorage.getItem('watchPartyUserId')) || null;
  const normalizedCurrentRole = String(currentParticipant?.role || currentRole || '').trim().toLowerCase();
  const canControl = normalizedCurrentRole === 'host' || normalizedCurrentRole === 'moderator';
  const canManage = normalizedCurrentRole === 'host';
  const hostId = room?.hostId;

  const roomUrl = buildRoomLink(roomId);
  const videoId = room?.videoId;
  const roomCurrentTime = room?.currentTime;
  const roomPlayState = room?.playState;

  useEffect(() => {
    if (!player || !videoId) return;

    const currentTime = Number(roomCurrentTime || 0);
    if (Math.abs(player.getCurrentTime() - currentTime) > 1.5) {
      isRemoteUpdateRef.current = true;
      player.seekTo(currentTime, true);
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 180);
    }

    const playerState = player.getPlayerState ? player.getPlayerState() : 2;
    if (roomPlayState === 'PLAYING' && playerState !== 1) {
      isRemoteUpdateRef.current = true;
      player.playVideo();
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 180);
    }

    if (roomPlayState === 'PAUSED' && playerState !== 2) {
      isRemoteUpdateRef.current = true;
      player.pauseVideo();
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 180);
    }
  }, [player, videoId, roomCurrentTime, roomPlayState]);

  async function copyInviteLink() {
    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(roomUrl);
          pushToast('Room link copied!', 'success');
          return;
        } catch {
          // Fall through to the legacy copy method when clipboard permissions are unavailable.
        }
      }

      const textArea = document.createElement('textarea');
      textArea.value = roomUrl;
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      let copied = false;
      try {
        copied = document.execCommand('copy');
      } finally {
        textArea.remove();
      }

      if (!copied) {
        throw new Error('The browser did not allow copying to the clipboard.');
      }

      pushToast('Room link copied!', 'success');
    } catch {
      pushToast('Could not copy the invite link. Please copy the room URL from your address bar.', 'error');
    }
  }

  function handleLeaveRoom() {
    if (!socket || !roomId) {
      navigate('/');
      return;
    }

    const otherParticipants = participantList.filter(
      (participant) => participant.userId !== currentUserId && participant.online !== false,
    );
    const moderatorPresent = otherParticipants.some((participant) => participant.role === 'moderator');
    if (canManage && otherParticipants.length > 0 && !moderatorPresent) {
      setPromotionTargetId(otherParticipants[0].userId);
      setHostLeavePrompt(true);
      return;
    }

    socket.emit('leave_room', { roomId });
  }

  function handleHostLeaveChoice(promoteModerator) {
    if (!socket || !roomId) return;

    socket.emit('leave_room', {
      roomId,
      promoteToUserId: promoteModerator ? promotionTargetId : undefined,
    });
    setHostLeavePrompt(false);
  }

  function handleCloseRoom() {
    if (!socket || !canManage) return;
    if (window.confirm('Close this room for everyone? This cannot be undone.')) {
      socket.emit('close_room', { roomId });
    }
  }

  function handleVideoReady(playerInstance) {
    setPlayer(playerInstance);
    playerInstance.seekTo(Number(room?.currentTime || 0), true);
  }

  function handlePlaybackTimeUpdate(currentTime) {
    if (!Number.isFinite(currentTime)) return;
    setPlaybackTime(currentTime);
    if (!canControl || !socket) return;
    if (Math.abs(currentTime - lastReportedPlaybackTimeRef.current) < 1) return;

    lastReportedPlaybackTimeRef.current = currentTime;
    socket.emit('playback_progress', { roomId, time: currentTime });
  }

  function handlePlayerStateChange(event) {
    const playerState = event.data;
    if (isRemoteUpdateRef.current || !socket || !room) {
      return;
    }

    if (playerState === 2 && canControl) {
      handlePlaybackTimeUpdate(event.target.getCurrentTime());
    }

    if (!canControl && (playerState === 1 || playerState === 2)) {
      isRemoteUpdateRef.current = true;
      if (room.playState === 'PLAYING') {
        player?.playVideo();
      } else {
        player?.pauseVideo();
      }
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 250);
      return;
    }

    if (playerState === 1) {
      socket.emit('play', { roomId });
    } else if (playerState === 2) {
      socket.emit('pause', { roomId });
    }
  }

  function handleSeekBarChange(event) {
    if (!canControl || !socket) return;
    const time = Number(event.target.value);
    socket.emit('seek', { roomId, time });
  }

  function handleLoadVideo(event) {
    event.preventDefault();
    if (!socket || !canControl) return;

    const extracted = extractYouTubeVideoId(draftVideoUrl);
    if (!extracted) {
      pushToast('Please enter a valid YouTube URL.', 'error');
      return;
    }

    socket.emit('change_video', { roomId, videoId: extracted });
    setDraftVideoUrl('');
  }

  function handleRoleChange(userId, nextRole) {
    if (!socket || !canManage) return;
    socket.emit('assign_role', { roomId, userId, role: String(nextRole || '').trim().toLowerCase() });
  }

  function handleRemoveParticipant(userId) {
    if (!socket || !canManage) return;
    socket.emit('remove_participant', { roomId, userId });
  }

  function handleApproveRejoin(userId) {
    if (!socket || !canManage) return;
    socket.emit('approve_rejoin', { roomId, userId });
  }

  function handleChatSend({ text, type }) {
    if (!socket || !roomId || room?.chatEnabled === false) return;
    socket.emit('chat_send', {
      roomId,
      text,
      type,
      videoTime: playbackTime,
    });
  }

  function handleChatToggle(enabled) {
    if (!socket || !roomId || !canManage) return;
    socket.emit('set_chat_enabled', { roomId, enabled });
  }

  if (roomClosed) {
    return (
      <div className="page-shell room-page">
        <section className="room-closed-card" role="status">
          <span className="room-closed-card__icon" aria-hidden="true">✓</span>
          <p className="eyebrow">Watch party ended</p>
          <h1>{closedByCurrentUser ? 'You closed the room' : 'The host closed the room'}</h1>
          <p>
            {closedByCurrentUser
              ? 'This room is now closed for everyone.'
              : 'This room is now closed. Thanks for watching together!'}
          </p>
          <button type="button" className="primary-btn" onClick={() => navigate('/')}>Back to home</button>
        </section>
      </div>
    );
  }

  if (removedFromRoom) {
    return (
      <div className="page-shell room-page">
        <section className="room-closed-card" role="status">
          <p className="eyebrow">Room access ended</p>
          <h1>You were removed from the room</h1>
          <p>The host removed you from this watch party.</p>
          <button type="button" className="primary-btn" onClick={() => navigate('/')}>Back to home</button>
        </section>
      </div>
    );
  }

  if (rejoinPending && !room) {
    return (
      <div className="page-shell room-page">
        <section className="room-closed-card" role="status">
          <p className="eyebrow">Rejoin request sent</p>
          <h1>Waiting for host approval</h1>
          <p>The host has been notified that you want to rejoin. Keep this page open while they review your request.</p>
          <button type="button" className="secondary-btn" onClick={() => navigate('/')}>
            Leave waiting room
          </button>
        </section>
      </div>
    );
  }

  if (roomError && !room) {
    return (
      <div className="page-shell room-page">
        <section className="room-closed-card" role="status">
          <p className="eyebrow">Unable to enter watch party</p>
          <h1>Could not join room</h1>
          <p>{roomError}</p>
          <button type="button" className="primary-btn" onClick={() => navigate(`/join-room/${roomId}`)}>
            Back to room entry
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className={`page-shell room-page ${canControl ? 'room-page--host' : 'room-page--guest'}`}>
      <Toast toasts={toastQueue} onDismiss={(id) => setToastQueue((old) => old.filter((toast) => toast.id !== id))} />

      {hostLeavePrompt && (
        <div className="room-leave-overlay">
          <section className="room-leave-dialog" role="dialog" aria-modal="true" aria-labelledby="room-leave-title">
            <p className="eyebrow">Before you leave</p>
            <h2 id="room-leave-title">No moderator is in this room</h2>
            <p>Promote a participant to moderator before leaving, or close the room for everyone.</p>
            <label htmlFor="successor-participant">Choose a participant to promote</label>
            <select
              id="successor-participant"
              value={promotionTargetId}
              onChange={(event) => setPromotionTargetId(event.target.value)}
            >
              {participantList
                .filter((participant) => participant.userId !== currentUserId && participant.online !== false)
                .map((participant) => (
                  <option key={participant.userId} value={participant.userId}>
                    {participant.username}
                  </option>
                ))}
            </select>
            <div className="room-leave-dialog__actions">
              <button type="button" className="primary-btn" onClick={() => handleHostLeaveChoice(true)}>
                Promote and leave
              </button>
              <button type="button" className="close-room-btn" onClick={() => handleHostLeaveChoice(false)}>
                Close room and leave
              </button>
              <button type="button" className="ghost-btn" onClick={() => setHostLeavePrompt(false)}>
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}

      <RoomHeader
        roomId={roomId}
        connectionStatus={status}
        onCopyLink={copyInviteLink}
        onLeaveRoom={handleLeaveRoom}
        isHost={canManage}
        onCloseRoom={handleCloseRoom}
      />

      <div className="room-layout">
        <main className="main-panel">
          <div className="player-card">
            {videoId ? (
              <YouTubePlayer
                videoId={videoId}
                onReady={handleVideoReady}
                onStateChange={handlePlayerStateChange}
                onTimeUpdate={handlePlaybackTimeUpdate}
                onDurationUpdate={setPlayerDuration}
              />
            ) : (
              <div className="youtube-player-loading" role="status">
                {room ? 'Waiting for the host to choose a video...' : 'Connecting to the room...'}
              </div>
            )}
          </div>

          <div className="video-info-card">
            <div className="video-meta-header">
              <div>
                <p className="eyebrow">Now playing</p>
                <h2>{!room ? 'Connecting to room...' : room.videoId ? 'YouTube Video' : 'Waiting for host...'}</h2>
              </div>
              <Badge role={currentRole} />
            </div>

            <div className="controls-block">
              {canControl && (
                <div className="controls-row">
                  <button type="button" className="primary-btn" onClick={() => socket && socket.emit('play', { roomId })}>Play</button>
                  <button type="button" className="secondary-btn" onClick={() => socket && socket.emit('pause', { roomId })}>Pause</button>
                </div>
              )}

              <div className="seek-block">
                <span>{formatTime(playbackTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={playerDuration || 1}
                  value={Math.min(playbackTime, playerDuration || 1)}
                  onChange={handleSeekBarChange}
                  disabled={!canControl || playerDuration <= 0}
                />
                <span>{formatTime(playerDuration)}</span>
              </div>

              {canControl ? (
                <form className="video-url-form" onSubmit={handleLoadVideo}>
                  <label htmlFor="video-url">YouTube Video</label>
                  <div className="input-row">
                    <input
                      id="video-url"
                      type="text"
                      value={draftVideoUrl}
                      onChange={(event) => setDraftVideoUrl(event.target.value)}
                      placeholder="Paste a YouTube video URL"
                    />
                    <button type="submit" className="primary-btn">Load Video</button>
                  </div>
                </form>
              ) : (
                <div className="permission-note">Playback is controlled by the Host or Moderator.</div>
              )}
            </div>

            {roomError && <p className="form-error">{roomError}</p>}
          </div>
        </main>

        <aside className="room-sidebar">
          {canManage && rejoinRequests.length > 0 && (
            <section className="participants-panel rejoin-requests-panel" aria-label="Rejoin requests">
              <div className="panel-header">
                <h3>Rejoin requests</h3>
                <span>{rejoinRequests.length} waiting</span>
              </div>
              <div className="participants-list">
                {rejoinRequests.map((request) => (
                  <div className="participant-item" key={request.userId}>
                    <div className="participant-main">
                      <div className="avatar">{request.username.charAt(0).toUpperCase()}</div>
                      <div>
                        <strong>{request.username}</strong>
                        <p>Wants to rejoin this room</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => handleApproveRejoin(request.userId)}
                    >
                      Allow
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
          <ParticipantList
            participants={participantList}
            currentUserId={currentUserId}
            onAssignRole={handleRoleChange}
            onRemoveParticipant={handleRemoveParticipant}
            canManage={canManage}
            hostId={hostId}
          />
          <RoomChat
            messages={chatMessages}
            currentUserId={currentUserId}
            connected={status === 'connected' && Boolean(socket?.connected)}
            enabled={room?.chatEnabled !== false}
            canManage={canManage}
            onToggle={handleChatToggle}
            onSend={handleChatSend}
          />
        </aside>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create-room" element={<CreateRoomPage />} />
      <Route path="/join-room" element={<JoinRoomPage />} />
      <Route path="/join-room/:roomId" element={<JoinRoomPage />} />
      <Route path="/room/:roomId" element={<WatchPartyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    if (!localStorage.getItem('watchPartyName')) {
      localStorage.setItem('watchPartyName', 'Guest');
    }
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
