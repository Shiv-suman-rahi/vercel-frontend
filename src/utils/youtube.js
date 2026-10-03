export function extractYouTubeVideoId(value) {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/i,
    /[?&]v=([A-Za-z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  const fallback = trimmed.match(/([A-Za-z0-9_-]{11})/);
  return fallback ? fallback[1] : null;
}

export function formatTime(seconds) {
  if (!Number.isFinite(Number(seconds))) {
    return '00:00';
  }

  const total = Math.max(0, Math.floor(Number(seconds)));
  const mins = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const secs = (total % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}
