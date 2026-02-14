import type { GalaxyState, TrailPoint } from "./types";
import { createStars } from "./stars";
import { getStarCount, drawGalaxy, drawFlashes } from "./galaxy";
import { drawPlanets, createPlanets } from "./planets";
import { drawComets, spawnComet } from "./comets";
import { drawNebula, drawVignette } from "./effects";
import { drawText } from "./text";
import { spawnSpawnNode, updateSpawns, drawSpawns } from "./spawns";

export type GalaxyConfig = {
  showPlanets?: boolean;
  showComets?: boolean;
  showNebula?: boolean;
  showVignette?: boolean;
  showSpawns?: boolean;
  text?: { title: string; subtitle?: string } | null;
};

export type GalaxyController = {
  destroy: () => void;
  setScrollProgress: (progress: number) => void;
};

const CONFIG = {
  mouseLerp: 0.05,
  cometSpawnRate: 0.009,
  maxComets: 3,
  fadeStars: { start: 0, duration: 120 },
  fadeText: { start: 40, duration: 80 },
  fadePlanets: { start: 150, duration: 100 },
} as const;

const DEFAULT: Required<GalaxyConfig> = {
  showPlanets: true,
  showComets: true,
  showNebula: true,
  showVignette: true,
  showSpawns: false,
  text: null,
};

export const initGalaxy = (
  canvas: HTMLCanvasElement,
  userConfig: GalaxyConfig = {},
) => {
  const config = { ...DEFAULT, ...userConfig };
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  let animationFrameId = 0;
  let isPaused = false;
  let initialRenderComplete = false;

  const planets = createPlanets();
  const state: GalaxyState = {
    width: 1,
    height: 1,
    centerX: 0,
    centerY: 0,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    gravityActive: true,
    time: 0,
    deltaTime: 1,
    stars: [],
    flashes: [],
    comets: [],
    planetTrails: planets.map(() => [] as TrailPoint[]),
    planets,
    spawns: [],
    nebulaSeed: Math.random() * Math.PI * 2,
    scrollProgress: 0,
  };

  const setCanvasSize = () => {
    const scale = window.devicePixelRatio || 1;
    const prevWidth = state.width;
    const prevHeight = state.height;
    state.width = canvas.offsetWidth || 1;
    state.height = canvas.offsetHeight || 1;
    state.centerX = state.width / 2;
    state.centerY = state.height / 2;
    canvas.width = state.width * scale;
    canvas.height = state.height * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const targetCount = getStarCount(state.width, state.height);
    if (!prevWidth || !prevHeight || state.stars.length === 0) {
      state.stars = createStars(state.width, state.height, targetCount);
      return;
    }

    if (Math.abs(state.stars.length - targetCount) > targetCount * 0.2) {
      state.stars = createStars(state.width, state.height, targetCount);
      return;
    }

    const sx = state.width / prevWidth;
    const sy = state.height / prevHeight;
    const scale2d = Math.min(sx, sy);
    for (const star of state.stars) {
      star.x *= sx;
      star.y *= sy;
      star.px *= sx;
      star.py *= sy;
      star.baseX *= sx;
      star.baseY *= sy;
    }
    for (const trail of state.planetTrails)
      for (const pt of trail) {
        pt.x *= sx;
        pt.y *= sy;
      }
    for (const c of state.comets) {
      c.x *= sx;
      c.y *= sy;
      c.length *= scale2d;
    }
    for (const f of state.flashes) {
      f.x *= sx;
      f.y *= sy;
      f.size *= scale2d;
    }
    state.mouseX *= sx;
    state.mouseY *= sy;
    state.targetMouseX *= sx;
    state.targetMouseY *= sy;
  };

  let lastTime = performance.now();
  const smoothstep = (t: number) => t * t * (3 - 2 * t);
  const fadeAlpha = (time: number, start: number, duration: number) =>
    smoothstep(Math.min(Math.max(0, (time - start) / duration), 1));

  const animate = () => {
    if (isPaused) return;
    const now = performance.now();
    state.deltaTime = Math.min(Math.max((now - lastTime) / 16.6667, 0.5), 2);
    lastTime = now;
    state.time += state.deltaTime;

    state.mouseX += (state.targetMouseX - state.mouseX) * CONFIG.mouseLerp;
    state.mouseY += (state.targetMouseY - state.mouseY) * CONFIG.mouseLerp;

    ctx.clearRect(0, 0, state.width, state.height);

    const starsAlpha = fadeAlpha(
      state.time,
      CONFIG.fadeStars.start,
      CONFIG.fadeStars.duration,
    );
    const textAlpha = fadeAlpha(
      state.time,
      CONFIG.fadeText.start,
      CONFIG.fadeText.duration,
    );
    const planetsAlpha = fadeAlpha(
      state.time,
      CONFIG.fadePlanets.start,
      CONFIG.fadePlanets.duration,
    );

    if (
      config.showComets &&
      state.comets.length < CONFIG.maxComets &&
      Math.random() < CONFIG.cometSpawnRate * state.deltaTime
    ) {
      spawnComet(state);
    }

    if (
      config.showSpawns &&
      state.spawns.length < 12 &&
      Math.random() < 0.015 * state.deltaTime
    ) {
      spawnSpawnNode(state);
    }

    if (config.showSpawns) updateSpawns(state);

    drawGalaxy(ctx, state, starsAlpha);
    drawFlashes(ctx, state, starsAlpha);
    if (config.showComets) drawComets(ctx, state, starsAlpha);
    if (config.showSpawns) drawSpawns(ctx, state, starsAlpha);
    if (config.showPlanets) drawPlanets(ctx, state, planetsAlpha);
    if (config.showNebula) drawNebula(ctx, state);
    if (config.showVignette) drawVignette(ctx, state);
    if (config.text) drawText(ctx, state, textAlpha, config.text);

    animationFrameId = requestAnimationFrame(animate);
  };

  const handleResize = () => setCanvasSize();
  const updatePointer = (x: number, y: number) => {
    const rect = canvas.getBoundingClientRect();
    state.targetMouseX = x - rect.left;
    state.targetMouseY = y - rect.top;
    state.gravityActive = true;
  };
  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      updatePointer(e.clientX, e.clientY);
    }
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handlePointerLeave = () => {
    state.gravityActive = false;
  };
  const handleVisibilityChange = () => {
    if (!initialRenderComplete) return;
    if (document.hidden) {
      isPaused = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else if (isPaused) {
      isPaused = false;
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    }
  };
  const handleWindowBlur = () => {
    if (!initialRenderComplete) return;
    isPaused = true;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
  const handleWindowFocus = () => {
    if (isPaused) {
      isPaused = false;
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    }
  };

  setCanvasSize();
  state.targetMouseX = state.centerX;
  state.targetMouseY = state.centerY;
  state.mouseX = state.centerX;
  state.mouseY = state.centerY;

  window.addEventListener("resize", handleResize);
  window.addEventListener("blur", handleWindowBlur);
  window.addEventListener("focus", handleWindowFocus);
  document.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseleave", handlePointerLeave);
  canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
  canvas.addEventListener("touchend", handlePointerLeave);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  setTimeout(() => {
    initialRenderComplete = true;
  }, 3000);

  animate();

  return {
    destroy: () => {
      isPaused = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handlePointerLeave);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    },
    setScrollProgress: (progress: number) => {
      state.scrollProgress = Math.max(0, Math.min(1, progress));
    },
  };
};
