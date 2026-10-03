import { useEffect, useRef } from 'react';

export default function YouTubePlayer({ videoId, onReady, onStateChange, onTimeUpdate, className }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const onReadyRef = useRef(onReady);
  const onStateChangeRef = useRef(onStateChange);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const videoIdRef = useRef(videoId);
  const loadedVideoIdRef = useRef(null);
  const playerReadyRef = useRef(false);
  const playerCreatedVideoIdRef = useRef(null);

  useEffect(() => {
    onReadyRef.current = onReady;
    onStateChangeRef.current = onStateChange;
    onTimeUpdateRef.current = onTimeUpdate;
  });

  useEffect(() => {
    videoIdRef.current = videoId;
    if (!videoId || !playerReadyRef.current || loadedVideoIdRef.current === videoId) return;

    playerRef.current?.loadVideoById(videoId);
    loadedVideoIdRef.current = videoId;
  }, [videoId]);

  useEffect(() => {
    let isCancelled = false;
    let poll;

    const initializePlayer = () => {
      if (isCancelled || !window.YT?.Player || !containerRef.current || playerRef.current) return;

      playerCreatedVideoIdRef.current = videoIdRef.current;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: playerCreatedVideoIdRef.current,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
        },
        events: {
          onReady: (event) => {
            if (!isCancelled) {
              playerReadyRef.current = true;
              if (playerCreatedVideoIdRef.current !== videoIdRef.current) {
                event.target.loadVideoById(videoIdRef.current);
              }
              loadedVideoIdRef.current = videoIdRef.current;
              onReadyRef.current?.(event.target);
            }
          },
          onStateChange: (event) => {
            if (!isCancelled) {
              onStateChangeRef.current?.(event);
            }
            if (event?.target && typeof onTimeUpdateRef.current === 'function') {
              onTimeUpdateRef.current(event.target.getCurrentTime ? event.target.getCurrentTime() : 0);
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initializePlayer();
    } else {
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.body.appendChild(tag);
      }

      poll = setInterval(() => {
        if (window.YT?.Player) {
          clearInterval(poll);
          poll = null;
          initializePlayer();
        }
      }, 200);
    }

    return () => {
      isCancelled = true;
      if (poll) clearInterval(poll);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
        playerReadyRef.current = false;
        loadedVideoIdRef.current = null;
        playerCreatedVideoIdRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`youtube-player-shell ${className || ''}`}>
      <div className="youtube-player" ref={containerRef} aria-label="YouTube video player" />
      <div className="youtube-player-interaction-blocker" aria-hidden="true" />
    </div>
  );
}
