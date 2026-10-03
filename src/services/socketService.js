export async function createRoomRequest(username) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Unable to create room.');
  }

  return payload;
}

export function buildRoomLink(roomId) {
  return `${window.location.origin}/room/${roomId}`;
}
