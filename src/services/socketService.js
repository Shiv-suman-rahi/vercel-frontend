import { apiRequest } from './api';

export async function createRoomRequest(csrfToken) {
  return apiRequest('/api/rooms', {
    method: 'POST',
    body: JSON.stringify({}),
    csrfToken,
  });
}

export function buildRoomLink(roomId) {
  return `${window.location.origin}/join-room/${roomId}`;
}
