import type { Star } from "./types";

const VISUAL = {
  trailSpeedMin: 0.35,
  trailDist: 500,
  trailOpacity: 0.24,
  trailOpacityMax: 0.3,
  trailWidthMin: 0.25,
  trailWidthScale: 0.2,
  chromaSpeedMin: 0.9,
  chromaMax: 0.35,
  chromaScale: 0.12,
  chromaOffset: 0.8,
  chromaSizeScale: 0.9,
  spikeThreshold: 0.6,
  spikeScale: 2.5,
  spikeOpacity: 0.4,
  spikeOpacityMax: 0.6,
  spikeWidth: 0.5,
  opacityBase: 0.3,
  opacityTwinkle: 0.25,
  opacitySpeedScale: 0.3,
  opacitySpeedMax: 0.4,
  driftScale: 0.15,
  driftSpeed: 0.002,
  driftFreq: 0.01,
} as const;

export const createStars = (
  width: number,
  height: number,
  count: number,
): Star[] =>
  Array.from({ length: count }, () => {
    const roll = Math.random();
    const size =
      roll < 0.75
        ? 0.2 + Math.random() * 0.5
        : roll < 0.95
          ? 0.5 + Math.random() * 0.8
          : 0.8 + Math.random();
    const x = Math.random() * width;
    const y = Math.random() * height;
    return {
      x,
      y,
      px: x,
      py: y,
      vx: 0,
      vy: 0,
      baseX: x,
      baseY: y,
      size,
      twinkleSpeed: 0.008 + Math.random() * 0.015,
      twinkleOffset: Math.random() * Math.PI * 2,
      depth: 0.2 + Math.random() * 0.8,
    };
  });

export const respawnStar = (star: Star, width: number, height: number) => {
  star.x = Math.random() * width;
  star.y = Math.random() * height;
  star.px = star.x;
  star.py = star.y;
  star.vx = 0;
  star.vy = 0;
};

export const renderStar = (
  ctx: CanvasRenderingContext2D,
  star: Star,
  time: number,
  alpha: number,
  dist: number,
  captureRadius: number,
) => {
  const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
  const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
  const opacity =
    (VISUAL.opacityBase +
      twinkle * VISUAL.opacityTwinkle +
      Math.min(speed * VISUAL.opacitySpeedScale, VISUAL.opacitySpeedMax)) *
    Math.min(dist / captureRadius, 1) *
    alpha;
  const drift = {
    x:
      Math.sin(time * VISUAL.driftSpeed + star.baseX * VISUAL.driftFreq) *
      VISUAL.driftScale,
    y:
      Math.cos(time * VISUAL.driftSpeed + star.baseY * VISUAL.driftFreq) *
      VISUAL.driftScale,
  };
  const drawX = star.x + drift.x;
  const drawY = star.y + drift.y;

  if (speed > VISUAL.trailSpeedMin && dist < VISUAL.trailDist) {
    ctx.strokeStyle = `rgba(255,255,255,${Math.min(opacity * VISUAL.trailOpacity, VISUAL.trailOpacityMax)})`;
    ctx.lineWidth = Math.max(
      VISUAL.trailWidthMin,
      star.size * VISUAL.trailWidthScale,
    );
    ctx.beginPath();
    ctx.moveTo(drawX, drawY);
    ctx.lineTo(star.px + drift.x, star.py + drift.y);
    ctx.stroke();
  }

  if (speed > VISUAL.chromaSpeedMin) {
    const dir = { x: star.vx / speed, y: star.vy / speed };
    const chroma = Math.min(speed * VISUAL.chromaScale, VISUAL.chromaMax);
    ctx.fillStyle = `rgba(255,120,140,${chroma})`;
    ctx.beginPath();
    ctx.arc(
      drawX + dir.x * VISUAL.chromaOffset,
      drawY + dir.y * VISUAL.chromaOffset,
      star.size * VISUAL.chromaSizeScale,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = `rgba(120,200,255,${chroma})`;
    ctx.beginPath();
    ctx.arc(
      drawX - dir.x * VISUAL.chromaOffset,
      drawY - dir.y * VISUAL.chromaOffset,
      star.size * VISUAL.chromaSizeScale,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.fillStyle = `rgba(255,255,255,${Math.min(opacity, 1)})`;
  ctx.beginPath();
  ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
  ctx.fill();

  if (star.size > VISUAL.spikeThreshold) {
    const spike = star.size * VISUAL.spikeScale;
    ctx.strokeStyle = `rgba(255,255,255,${Math.min(opacity * VISUAL.spikeOpacity, VISUAL.spikeOpacityMax)})`;
    ctx.lineWidth = VISUAL.spikeWidth;
    ctx.beginPath();
    ctx.moveTo(drawX - spike, drawY);
    ctx.lineTo(drawX + spike, drawY);
    ctx.moveTo(drawX, drawY - spike);
    ctx.lineTo(drawX, drawY + spike);
    ctx.stroke();
  }
};
