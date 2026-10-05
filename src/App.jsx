import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { buildRoomLink, createRoomRequest } from './services/socketService';
import { extractYouTubeVideoId, formatTime } from './utils/youtube';
import RoomHeader from './components/RoomHeader';
import ParticipantList from './components/ParticipantList';
import YouTubePlayer from './components/YouTubePlayer';
import Toast from './components/Toast';
import Badge from './components/Badge';
import { backendUrl } from './config';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page-shell home-page">
      <nav className="top-nav">
        <div className="brand">
          <span className="brand-mark">▶</span>
          Watch Party
        </div>
      </nav>

      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Real-time co-watching</p>
          <h1>Watch YouTube Together in Real Time</h1>
          <p className="lede">
            Create a room, invite your friends, and enjoy YouTube together with synchronized playback.
          </p>
          <div className="cta-row">
            <button type="button" className="primary-btn" onClick={() => navigate('/create-room')}>
              Create Room
            </button>
            <button type="button" className="secondary-btn" onClick={() => navigate('/join-room')}>
              Join Room
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-label="Watch party preview">
          <div className="preview-window">
            <div className="preview-header">
              <span />
              <span />
              <span />
            </div>
            <div className="preview-body">
              <div className="preview-video" />
              <div className="preview-chat">
                <div className="preview-user"><span className="dot green" /> Shiv</div>
                <div className="preview-user"><span className="dot purple" /> Rahul</div>
                <div className="preview-user"><span className="dot blue" /> Aman</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-grid">
        {[
          ['Real-Time Sync', 'Everyone sees the same playback state.'],
          ['Shared Rooms', 'Create a private room and invite others.'],
          ['Role-Based Control', 'Host, moderator and participant permissions.'],
          ['YouTube Powered', 'Watch YouTube videos together.'],
          ['Responsive', 'Works across desktop, tablet and mobile.'],
          ['Secure Permissions', 'The backend validates control permissions.'],
        ].map(([title, text]) => (
          <div className="feature-card" key={title}>
            <div className="feature-icon">{title[0]}</div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
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

  async function handleJoinRoom(event) {
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

    try {
      const socket = io(backendUrl, {
        transports: ['websocket'],
      });

      const timeout = setTimeout(() => {
        socket.disconnect();
        setError('Unable to connect to the room right now.');
        setLoading(false);
      }, 6000);

      socket.on('connect', () => {
        socket.emit('join_room', { roomId: finalRoomId, username: name.trim() });
      });

      socket.on('session', ({ roomId: joinedRoomId, userId }) => {
        clearTimeout(timeout);
        localStorage.setItem('watchPartyUserId', userId);
        socket.disconnect();
        navigate(`/room/${joinedRoomId}`);
      });

      socket.on('error', ({ message }) => {
        clearTimeout(timeout);
        socket.disconnect();
        setError(message || 'Unable to join room.');
        setLoading(false);
      });
    } catch (err) {
      setError(err.message || 'Unable to join room.');
      setLoading(false);
    }
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

    roomSocket.on('session', ({ userId, role }) => {
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
      navigate('/join-room');
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
    if (socket && roomId) {
      socket.emit('leave_room', { roomId });
    }
    navigate('/');
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

  return (
    <div className={`page-shell room-page ${canControl ? 'room-page--host' : 'room-page--guest'}`}>
      <Toast toasts={toastQueue} onDismiss={(id) => setToastQueue((old) => old.filter((toast) => toast.id !== id))} />

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

        <ParticipantList
          participants={participantList}
          currentUserId={currentUserId}
          onAssignRole={handleRoleChange}
          onRemoveParticipant={handleRemoveParticipant}
          canManage={canManage}
          hostId={hostId}
        />
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
