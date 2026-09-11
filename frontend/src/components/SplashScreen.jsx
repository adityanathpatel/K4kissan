import React, { useState, useEffect, useRef } from 'react';

/**
 * SplashScreen
 *
 * Plays the intro video on initial website open:
 * 1. Plays the full-screen cinematic video automatically.
 * 2. In the last 1 second of the video, it smoothly fades out.
 * 3. The underlying website smoothly emerges and becomes active.
 * 4. Includes resilience fallbacks (autoplay safety, error recovery, skip option).
 */
export default function SplashScreen({ onDone }) {
    const videoRef = useRef(null);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [videoReady, setVideoReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const fadeTriggeredRef = useRef(false);
    const doneTriggeredRef = useRef(false);

    const triggerDone = () => {
        if (doneTriggeredRef.current) return;
        doneTriggeredRef.current = true;
        if (onDone) onDone();
    };

    const triggerFadeOut = (remainingTimeMs = 1000) => {
        if (fadeTriggeredRef.current) return;
        fadeTriggeredRef.current = true;
        setIsFadingOut(true);

        // Notify parent when fade-out finishes
        setTimeout(() => {
            triggerDone();
        }, remainingTimeMs);
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Try playing video programmatically
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setVideoReady(true);
                })
                .catch((err) => {
                    console.warn('[SplashScreen] Autoplay prevented, ensuring muted:', err);
                    video.muted = true;
                    video.play().catch(() => {
                        // Fallback: don't lock the user out if video cannot play
                        triggerFadeOut(600);
                    });
                });
        }

        // Safety fallback timer: in case video stalls or fails to reach end
        const safetyTimer = setTimeout(() => {
            triggerFadeOut(800);
        }, 6000);

        return () => {
            clearTimeout(safetyTimer);
        };
    }, []);

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video || !video.duration || Number.isNaN(video.duration)) return;

        const current = video.currentTime;
        const total = video.duration;
        const remaining = total - current;

        setProgress(Math.min(100, (current / total) * 100));

        // When in the last 1 second of video playback, initiate fade out
        if (remaining <= 1.05 && !fadeTriggeredRef.current) {
            triggerFadeOut(Math.max(400, remaining * 1000));
        }
    };

    const handleEnded = () => {
        triggerDone();
    };

    const handleError = (e) => {
        console.error('[SplashScreen] Video failed to load/play:', e);
        // Fallback immediately so user can access the website
        triggerDone();
    };



    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden select-none"
            style={{
                opacity: isFadingOut ? 0 : 1,
                transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: isFadingOut ? 'none' : 'auto',
            }}
            aria-label="Welcome video intro"
            role="dialog"
            aria-modal="true"
        >
            {/* Cinematic Video Element */}
            <video
                ref={videoRef}
                src="/videos/splash.mp4"
                autoPlay
                muted={isMuted}
                playsInline
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onError={handleError}
                onLoadedMetadata={() => setVideoReady(true)}
                className="w-full h-full object-cover sm:object-cover"
                style={{
                    filter: isFadingOut ? 'brightness(0.95)' : 'contrast(1.08) saturate(1.12) brightness(1.02)',
                    transform: isFadingOut ? 'scale(1.02)' : 'scale(1)',
                    transition: 'transform 1000ms ease-out, filter 1000ms ease-out',
                    willChange: 'transform, opacity, filter',
                    imageRendering: '-webkit-optimize-contrast',
                    backfaceVisibility: 'hidden',
                }}
            />

            {/* Subtle Gradient Vignette Overlays for cinematic polish */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />

            {/* Bottom Subtle Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                <div
                    className="h-full bg-emerald-500 transition-all duration-150 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
