import { useEffect, useRef, useState } from 'react';
import { formatTime } from '../utils/youtube';

const QUICK_REACTIONS = ['❤️', '😂', '👏', '😮', '🔥'];

export default function RoomChat({ messages, currentUserId, connected, onSend }) {
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  function handleSubmit(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !connected) return;
    onSend({ text, type: 'message' });
    setDraft('');
  }

  return (
    <section className="room-chat" aria-label="Live room chat">
      <div className="room-chat__header">
        <div>
          <h3>Live chat</h3>
          <p>Reactions and replies, together</p>
        </div>
        <span className={`room-chat__live ${connected ? 'is-connected' : ''}`}>
          <i /> {connected ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>

      <div className="room-chat__messages" role="log" aria-live="polite" aria-relevant="additions text">
        {messages.length === 0 ? (
          <p className="room-chat__empty">Say hello or send a reaction while you watch.</p>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.userId === currentUserId;
            return (
              <article
                className={`room-chat__message ${isOwnMessage ? 'is-own' : ''} ${message.type === 'reaction' ? 'is-reaction' : ''}`}
                key={message.id}
              >
                <div className="room-chat__message-meta">
                  <strong>{isOwnMessage ? 'You' : message.username}</strong>
                  {message.role === 'host' && <span>HOST</span>}
                  <time dateTime={message.createdAt}>{formatTime(message.videoTime)}</time>
                </div>
                <p>{message.text}</p>
              </article>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="room-chat__reactions" aria-label="Quick reactions">
        {QUICK_REACTIONS.map((reaction) => (
          <button
            type="button"
            key={reaction}
            onClick={() => onSend({ text: reaction, type: 'reaction' })}
            disabled={!connected}
            aria-label={`Send ${reaction} reaction`}
          >
            {reaction}
          </button>
        ))}
      </div>

      <form className="room-chat__composer" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="room-chat-message">Write a message</label>
        <input
          id="room-chat-message"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, 300))}
          maxLength={300}
          placeholder="Write a message..."
          disabled={!connected}
        />
        <button type="submit" disabled={!connected || !draft.trim()} aria-label="Send message">
          Send
        </button>
      </form>
    </section>
  );
}
