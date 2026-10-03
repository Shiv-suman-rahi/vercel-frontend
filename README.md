# Frontend App

This directory contains the React + Vite client for the YouTube Watch Party System.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

## Production build

```bash
npm run build
```

## Notes

- The production fallback backend is `https://render-backend-2-uot0.onrender.com`. For local development, set `VITE_BACKEND_URL=http://localhost:3000` in your frontend `.env`.
- Full setup and architecture details are documented in the project root README and ARCHITECTURE.md files.
