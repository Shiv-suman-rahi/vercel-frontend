import { useEffect, useRef } from 'react';

export default function YouTubePlayer({ videoId, onReady, onStateChange, onTimeUpdate, className }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoId) return undefined;

    let isCancelled = false;

    const initializePlayer = () => {
      if (!window.YT || !window.YT.Player || !containerRef.current) return;
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        return;
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          controls: 1,
        },
        events: {
          onReady: (event) => {
            if (!isCancelled) {
              onReady(event.target);
            }
          },
          onStateChange: (event) => {
            if (!isCancelled) {
              onStateChange(event);
            }
            if (event?.target && typeof onTimeUpdate === 'function') {
              onTimeUpdate(event.target.getCurrentTime ? event.target.getCurrentTime() : 0);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initializePlayer();
      return () => {
        isCancelled = true;
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      };
    }

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.body.appendChild(tag);
    }

    const poll = setInterval(() => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        clearInterval(poll);
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearInterval(poll);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, onReady, onStateChange, onTimeUpdate]);

  return <div className={`youtube-player ${className || ''}`} ref={containerRef} aria-label="YouTube video player" />;
}
