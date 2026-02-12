import type { GalaxyState } from "./types";

const NEBULA = {
  speed: 0.0006,
  driftX: 0.15,
  driftY: 0.12,
  driftYSpeed: 1.2,
  radius: 0.6,
  innerColor: "rgba(88,130,255,0.08)",
  midColor: "rgba(186,120,255,0.05)",
  outerColor: "rgba(255,140,90,0.04)",
  midStop: 0.45,
  outerStop: 0.7,
} as const;

const VIGNETTE = {
  radius: 0.7,
  fadeStart: 0.5,
  edgeOpacity: 0.6,
} as const;

export const drawNebula = (
  ctx: CanvasRenderingContext2D,
  state: GalaxyState,
) => {
  const { centerX, centerY, width, height, time, nebulaSeed } = state;
  const t = time * NEBULA.speed + nebulaSeed;
  const nx = centerX + Math.cos(t) * width * NEBULA.driftX;
  const ny =
    centerY + Math.sin(t * NEBULA.driftYSpeed) * height * NEBULA.driftY;
  const r = Math.max(width, height) * NEBULA.radius;
  const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);
  grad.addColorStop(0, NEBULA.innerColor);
  grad.addColorStop(NEBULA.midStop, NEBULA.midColor);
  grad.addColorStop(NEBULA.outerStop, NEBULA.outerColor);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};

export const drawVignette = (
  ctx: CanvasRenderingContext2D,
  state: GalaxyState,
) => {
  const { centerX, centerY, width, height } = state;
  const r = Math.max(width, height) * VIGNETTE.radius;
  const grad = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    r,
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(VIGNETTE.fadeStart, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(0,0,0,${VIGNETTE.edgeOpacity})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
};
