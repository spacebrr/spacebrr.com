import type { GalaxyState, Star } from "./types";
import { renderStar, respawnStar } from "./stars";

export const PHYSICS = {
  gravity: 300,
  vortex: 4,
  damping: 0.06,
  arms: 2,
  armTightness: 0.05,
  armStrength: 0.9,
  armNoise: 0.3,
  spiralSpeed: 0.005,
  capture: 16,
  soften: 100,
  maxSpeed: 0.8,
  maxSpeedScale: 10,
  starDensity: 0.002,
  starMin: 400,
  starMax: 4000,
  wrapMargin: 50,
  dragScale: 0.5,
} as const;

const FLASH = {
  maxCount: 80,
  initialLife: 0.9,
  sizeBase: 3,
  sizeRange: 5,
  alphaBase: 0.25,
  alphaRange: 0.2,
  decayRate: 0.12,
  lineWidth: 0.7,
  sizeGrowth: 2,
} as const;

export const getStarCount = (width: number, height: number): number =>
  Math.min(
    PHYSICS.starMax,
    Math.max(PHYSICS.starMin, Math.floor(width * height * PHYSICS.starDensity)),
  );

type StarPhysicsResult = { captured: boolean; dist: number };

export const updateStar = (
  star: Star,
  mouseX: number,
  mouseY: number,
  gravityActive: boolean,
  deltaTime: number,
  time: number,
  width: number,
  height: number,
): StarPhysicsResult => {
  star.px = star.x;
  star.py = star.y;

  const dx = star.x - mouseX;
  const dy = star.y - mouseY;
  const distSq = dx * dx + dy * dy + PHYSICS.soften;
  const dist = Math.sqrt(distSq);

  if (!gravityActive || dist <= PHYSICS.capture) {
    return { captured: gravityActive && dist <= PHYSICS.capture, dist };
  }

  const invDist = 1 / dist;
  const invSqrt = 1 / Math.sqrt(dist);

  const tangentX = -dy * invDist;
  const tangentY = dx * invDist;

  const spiralRotation = time * PHYSICS.spiralSpeed;
  const armNoise = star.twinkleOffset * PHYSICS.armNoise;
  const armPhase = Math.sin(
    Math.atan2(dy, dx) * PHYSICS.arms +
      dist * PHYSICS.armTightness -
      spiralRotation +
      armNoise,
  );

  const gravity = PHYSICS.gravity / distSq;
  const swirl = PHYSICS.vortex * invSqrt * (1 + armPhase * PHYSICS.armStrength);

  star.vx += (-dx * invDist * gravity + tangentX * swirl) * deltaTime;
  star.vy += (-dy * invDist * gravity + tangentY * swirl) * deltaTime;

  const radialVel = star.vx * dx * invDist + star.vy * dy * invDist;
  star.vx -= dx * invDist * radialVel * PHYSICS.damping * invSqrt * deltaTime;
  star.vy -= dy * invDist * radialVel * PHYSICS.damping * invSqrt * deltaTime;

  const drag = Math.max(0, 1 - PHYSICS.damping * PHYSICS.dragScale * deltaTime);
  star.vx *= drag;
  star.vy *= drag;
  star.x += star.vx * deltaTime;
  star.y += star.vy * deltaTime;

  const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
  const maxSpeed = PHYSICS.maxSpeed * invDist * PHYSICS.maxSpeedScale;
  if (speed > maxSpeed) {
    star.vx = (star.vx / speed) * maxSpeed;
    star.vy = (star.vy / speed) * maxSpeed;
  }

  if (star.x < -PHYSICS.wrapMargin) star.x = width + PHYSICS.wrapMargin;
  if (star.x > width + PHYSICS.wrapMargin) star.x = -PHYSICS.wrapMargin;
  if (star.y < -PHYSICS.wrapMargin) star.y = height + PHYSICS.wrapMargin;
  if (star.y > height + PHYSICS.wrapMargin) star.y = -PHYSICS.wrapMargin;

  return { captured: false, dist };
};

export const drawGalaxy = (
  ctx: CanvasRenderingContext2D,
  state: GalaxyState,
  alpha: number,
) => {
  const {
    width,
    height,
    mouseX,
    mouseY,
    gravityActive,
    time,
    deltaTime,
    stars,
    flashes,
  } = state;

  for (const star of stars) {
    const { captured, dist } = updateStar(
      star,
      mouseX,
      mouseY,
      gravityActive,
      deltaTime,
      time,
      width,
      height,
    );

    if (captured && flashes.length < FLASH.maxCount) {
      flashes.push({
        x: mouseX,
        y: mouseY,
        life: FLASH.initialLife,
        size: FLASH.sizeBase + Math.random() * FLASH.sizeRange,
        tilt: Math.random() * Math.PI,
        alpha: FLASH.alphaBase + Math.random() * FLASH.alphaRange,
      });
      respawnStar(star, width, height);
    } else {
      renderStar(ctx, star, time, alpha, dist, PHYSICS.capture);
    }
  }
};

export const drawFlashes = (
  ctx: CanvasRenderingContext2D,
  state: GalaxyState,
  alpha: number,
) => {
  state.flashes = state.flashes.filter((f) => f.life > 0);
  for (const f of state.flashes) {
    const size = f.size + (1 - f.life) * f.size * FLASH.sizeGrowth;
    ctx.strokeStyle = `rgba(255,255,255,${f.alpha * f.life * alpha})`;
    ctx.lineWidth = FLASH.lineWidth;
    ctx.beginPath();
    ctx.moveTo(f.x - Math.cos(f.tilt) * size, f.y - Math.sin(f.tilt) * size);
    ctx.lineTo(f.x + Math.cos(f.tilt) * size, f.y + Math.sin(f.tilt) * size);
    ctx.moveTo(
      f.x - Math.cos(f.tilt + Math.PI / 2) * size,
      f.y - Math.sin(f.tilt + Math.PI / 2) * size,
    );
    ctx.lineTo(
      f.x + Math.cos(f.tilt + Math.PI / 2) * size,
      f.y + Math.sin(f.tilt + Math.PI / 2) * size,
    );
    ctx.stroke();
    f.life -= FLASH.decayRate * state.deltaTime;
  }
};
