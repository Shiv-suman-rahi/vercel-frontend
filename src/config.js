export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://render-backend-2-uot0.onrender.com';
export const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : backendUrl);
