// Scrubs the hero video with horizontal mouse or touch movement.
// Mouse at the left edge = first frame, right edge = last frame,
// so the character turns to look toward the cursor.

const hero = document.querySelector(".hero");
const video = document.querySelector(".hero__video");
const hint = document.querySelector(".hero__hint");

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SMOOTHING = reducedMotion ? 0 : 0.35; // seconds to cover ~2/3 of the distance; higher = slower
const FPS = 60;                             // frame rate of assets/video/hero.mp4

let target = 0;      // wanted position: 0 = start, 1 = end
let current = 0;     // eased position shown on screen
let lastFrame = -1;  // last video frame we asked for
let frameCount = 0;  // set once the video metadata is loaded
let frameId = 0;
let lastTick = 0;
let dragStartX = null;
let dragStartTarget = 0;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function setTarget(value) {
  target = clamp01(value);
  hint.classList.add("is-hidden");
  startLoop();
}

function startLoop() {
  if (!frameCount || frameId) return;
  lastTick = performance.now();
  frameId = requestAnimationFrame(update);
}

function update(now) {
  // Time-based easing: same speed on 60Hz and 120Hz screens.
  // Clamped: the first timestamp can be slightly before lastTick, and tabs can pause.
  const seconds = Math.min(0.1, Math.max(0, (now - lastTick) / 1000));
  lastTick = now;
  const step = SMOOTHING ? 1 - Math.exp(-seconds / SMOOTHING) : 1;

  current += (target - current) * step;
  if (Math.abs(target - current) < 0.001) current = target;

  // Seek to a whole frame, and only when the last seek has finished,
  // so we never ask for the same frame twice or pile up requests.
  const frame = Math.round(current * (frameCount - 1));
  if (!video.seeking && frame !== lastFrame) {
    video.currentTime = (frame + 0.5) / FPS;
    lastFrame = frame;
  }

  const done = current === target && frame === lastFrame;
  frameId = done ? 0 : requestAnimationFrame(update);
}

// Mouse / pen: position across the window picks the frame.
// Touch: dragging moves relative to where the finger started.
function onPointerMove(event) {
  if (event.pointerType !== "touch") {
    setTarget(event.clientX / innerWidth);
  } else if (dragStartX !== null) {
    setTarget(dragStartTarget + (event.clientX - dragStartX) / innerWidth);
  }
}

function onTouchStart(event) {
  if (event.pointerType !== "touch") return;
  dragStartX = event.clientX;
  dragStartTarget = target;
}

function onTouchEnd() {
  dragStartX = null;
}

function onMetadata() {
  frameCount = Math.round(video.duration * FPS);
  startLoop();
}

// All listeners share one signal, so a single abort() removes them.
const listeners = new AbortController();
const options = { passive: true, signal: listeners.signal };

window.addEventListener("pointermove", onPointerMove, options);
hero.addEventListener("pointerdown", onTouchStart, options);
window.addEventListener("pointerup", onTouchEnd, options);
window.addEventListener("pointercancel", onTouchEnd, options);

if (video.readyState >= 1) onMetadata();
else video.addEventListener("loadedmetadata", onMetadata, { once: true, signal: listeners.signal });

// Clean up when the page is really closed (not just cached for "back").
window.addEventListener("pagehide", (event) => {
  if (event.persisted) return;
  cancelAnimationFrame(frameId);
  listeners.abort();
});
