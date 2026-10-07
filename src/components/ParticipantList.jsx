import Badge from './Badge';

export default function ParticipantList({ participants = [], currentUserId, onAssignRole, onRemoveParticipant, canManage, hostId }) {
  return (
    <aside className="participants-panel">
      <div className="panel-header">
        <h3>Participants</h3>
        <span>{participants.length} {participants.length === 1 ? 'person' : 'people'}</span>
      </div>

      <div className="participants-list">
        {participants.length === 0 ? (
          <div className="empty-state compact">
            <p>No one else is here yet.</p>
          </div>
        ) : (
          participants.map((participant) => {
            const isHost = participant.userId === hostId;
            const isCurrentUser = participant.userId === currentUserId;
            const canManageThisParticipant = canManage && !isHost && !isCurrentUser;
            const isModerator = participant.role === 'moderator';

            return (
              <div key={participant.userId} className={`participant-item ${isCurrentUser ? 'is-me' : ''}`}>
                <div className="participant-main">
                  <div className="avatar">{participant.username?.charAt(0)?.toUpperCase() || 'U'}</div>
                  <div>
                    <div className="participant-name-row">
                      <strong>{participant.username}</strong>
                      {isCurrentUser && <span className="you-badge">You</span>}
                    </div>
                    <Badge role={participant.role} />
                  </div>
                </div>

                {canManageThisParticipant && (
                  <div className="participant-actions">
                    {isModerator ? (
                      <button type="button" onClick={() => onAssignRole(participant.userId, 'participant')}>
                        Demote to Participant
                      </button>
                    ) : (
                      <button type="button" onClick={() => onAssignRole(participant.userId, 'moderator')}>
                        Make Moderator
                      </button>
                    )}
                    <button type="button" className="danger" onClick={() => onRemoveParticipant(participant.userId)}>
                      {isModerator ? 'Remove from Room' : 'Remove Participant'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
