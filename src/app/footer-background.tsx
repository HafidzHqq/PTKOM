'use client';

import { useEffect, useRef } from 'react';
import gazeFrames from './gaze-frames.json';

const TAU = Math.PI * 2;
const wrappedAngle = (angle: number) => (angle % TAU + TAU) % TAU;

// These angles were measured from the actual pupil positions in the clip's
// first complete orbit. Match direction, rather than assuming constant speed.
function timeForAngle(angle: number) {
  const target = wrappedAngle(angle);
  let nearestTime = gazeFrames[0][1];
  let nearestDistance = Infinity;
  for (const [sampleAngle, time] of gazeFrames) {
    const difference = Math.abs(target - sampleAngle);
    const distance = Math.min(difference, TAU - difference);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestTime = time;
    }
  }
  return nearestTime + 1 / 240;
}

export default function FooterBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current!;
    let frame = 0;
    let desiredTime = 0;
    let currentTime = 0; // untuk smooth lerp
    let pointer: { x: number; y: number } | null = null;
    let disposed = false;
    let animating = false;
    const mobile = window.matchMedia('(max-width: 700px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const seek = () => {
      frame = 0;
      if (disposed || video.readyState < 2 || video.seeking) return;
      if (Math.abs(video.currentTime - desiredTime) > 1 / 48) {
        const targetTime = Math.min(desiredTime, video.duration - 1 / 24);
        if ('fastSeek' in video) {
          (video as HTMLVideoElement & { fastSeek: (time: number) => void }).fastSeek(targetTime);
        } else {
          video.currentTime = targetTime;
        }
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(seek);
    };

    // Smooth animation loop untuk mobile touch tracking
    const smoothSeek = () => {
      if (disposed) return;
      // Lerp currentTime menuju desiredTime
      const diff = desiredTime - currentTime;
      if (Math.abs(diff) > 0.001) {
        currentTime += diff * 0.12; // 0.12 = kecepatan smooth (semakin kecil semakin lambat)
        if (video.readyState >= 2 && !video.seeking) {
          video.currentTime = Math.min(currentTime, video.duration - 1 / 24);
        }
        requestAnimationFrame(smoothSeek);
      } else {
        animating = false;
      }
    };
    const startSmooth = () => {
      if (!animating) {
        animating = true;
        requestAnimationFrame(smoothSeek);
      }
    };

    const updateTarget = () => {
      if (!pointer) return;
      const rect = video.getBoundingClientRect();
      const scale = Math.max(rect.width / 1920, rect.height / 1080);
      // Match the exact object-fit: cover positioning, including mobile crops.
      const eyeX = rect.left + rect.width / 2 + (948 - 960) * scale;
      const eyeY = rect.top + rect.height / 2 + (418 - 540) * scale;
      const dx = pointer.x - eyeX;
      const dy = pointer.y - eyeY;
      // Avoid unstable angles directly between the eyes.
      if (Math.hypot(dx, dy) > 8) {
        desiredTime = timeForAngle(Math.atan2(dy, dx));
        if (mobile.matches) {
          startSmooth();
        } else {
          schedule();
        }
      }
    };
    const move = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      updateTarget();
    };
    // Touch handler untuk mobile
    const onTouch = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const t = event.touches[0];
        pointer = { x: t.clientX, y: t.clientY };
        updateTarget();
      }
    };
    const ready = () => {
      video.loop = false;
      video.pause();

      if (mobile.matches) {
        // Mulai dari posisi netral, siap di-track sentuhan
        desiredTime = 1.0;
        currentTime = 1.0;
        try {
          video.currentTime = 1.0;
        } catch {
          // ignore seek error on unready video
        }
      } else {
        if (!pointer) {
          desiredTime = 1.0;
          try {
            video.currentTime = 1.0;
          } catch {
            // ignore seek error
          }
        } else {
          updateTarget();
          schedule();
        }
      }
    };
    // Coalesce fast pointer movements while a frame is decoding. When it
    // finishes, seek immediately to the latest requested gaze direction.
    video.addEventListener('seeked', schedule);
    video.addEventListener('loadeddata', ready);
    video.addEventListener('canplay', ready);
    mobile.addEventListener('change', ready);
    reducedMotion.addEventListener('change', ready);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, { passive: true });
    if (video.readyState >= 2) ready();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      video.removeEventListener('seeked', schedule);
      video.removeEventListener('loadeddata', ready);
      video.removeEventListener('canplay', ready);
      mobile.removeEventListener('change', ready);
      reducedMotion.removeEventListener('change', ready);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('scroll', updateTarget);
    };
  }, []);

  return (
    <div className="footer-background" aria-hidden="true">
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        poster="/footer-poster.webp"
        src="/footer-scrub.mp4"
      />
    </div>
  );
}