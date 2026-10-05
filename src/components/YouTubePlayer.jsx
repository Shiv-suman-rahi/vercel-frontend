import { useEffect, useRef, useState } from 'react';

export default function YouTubePlayer({ videoId, onReady, onStateChange, onTimeUpdate, onDurationUpdate, className }) {
  const shellRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);
  const onReadyRef = useRef(onReady);
  const onStateChangeRef = useRef(onStateChange);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onDurationUpdateRef = useRef(onDurationUpdate);
  const videoIdRef = useRef(videoId);
  const loadedVideoIdRef = useRef(null);
  const playerReadyRef = useRef(false);
  const playerCreatedVideoIdRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    onReadyRef.current = onReady;
    onStateChangeRef.current = onStateChange;
    onTimeUpdateRef.current = onTimeUpdate;
    onDurationUpdateRef.current = onDurationUpdate;
  });

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === shellRef.current);
    };

    document.addEventListener('fullscreenchange', updateFullscreenState);
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
  }, []);

  useEffect(() => {
    onDurationUpdateRef.current?.(0);
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
              timeUpdateIntervalRef.current = setInterval(() => {
                const playerState = event.target.getPlayerState();
                if (typeof onTimeUpdateRef.current === 'function') {
                  onTimeUpdateRef.current(event.target.getCurrentTime());
                }
                if (playerState !== -1 && playerState !== 3) {
                  const duration = event.target.getDuration();
                  if (Number.isFinite(duration) && duration > 0) {
                    onDurationUpdateRef.current?.(duration);
                  }
                }
              }, 1000);
            }
          },
          onStateChange: (event) => {
            if (!isCancelled) {
              onStateChangeRef.current?.(event);
            }
            if (event?.target && typeof onTimeUpdateRef.current === 'function') {
              onTimeUpdateRef.current(event.target.getCurrentTime ? event.target.getCurrentTime() : 0);
            }
            if (event?.target && event.data !== -1 && event.data !== 3) {
              const duration = event.target.getDuration?.();
              if (Number.isFinite(duration) && duration > 0) {
                onDurationUpdateRef.current?.(duration);
              }
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
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
        playerReadyRef.current = false;
        loadedVideoIdRef.current = null;
        playerCreatedVideoIdRef.current = null;
      }
    };
  }, []);

  async function toggleFullscreen() {
    const shell = shellRef.current;
    if (!shell) return;

    try {
      if (document.fullscreenElement === shell) {
        await document.exitFullscreen();
      } else {
        await shell.requestFullscreen();
      }
    } catch (error) {
      console.error('Unable to change video fullscreen state:', error);
    }
  }

  return (
    <div ref={shellRef} className={`youtube-player-shell ${className || ''}`}>
      <div className="youtube-player" ref={containerRef} aria-label="YouTube video player" />
      <div className="youtube-player-interaction-blocker" aria-hidden="true" />
      <button
        type="button"
        className="player-fullscreen-btn"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
        aria-pressed={isFullscreen}
      >
        {isFullscreen ? 'Exit full screen' : 'Full screen'}
      </button>
    </div>
  );
}
