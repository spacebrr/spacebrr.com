import type { GalaxyState, Planet } from "./types";

const ORBITAL = {
  systemRotation: 0.00006,
  precessionSpeed: 0.0002,
  precessionAmount: 0.04,
  wobbleSpeed: 0.00015,
  wobbleAmount: 0.015,
  trailLength: 450,
  trailStep: 2,
  trailOpacity: 0.08,
  trailSizeScale: 0.3,
  glowScale: 4,
  glowMidStop: 0.5,
  glowMidAlphaScale: 0.32,
  glowAlphaBase: 0.25,
  glowAlphaHover: 0.4,
  hoverRadius: 60,
  hoverLerp: 0.08,
  hoverGlowBoost: 2,
  hoverSizeBoost: 0.5,
} as const;

const PLANETS: Omit<
  Planet,
  "phase" | "currentX" | "currentY" | "hoverIntensity"
>[] = [
  {
    semiMajor: 100,
    semiMinor: 85,
    speed: 0.0018,
    size: 2,
    color: "176,162,151",
  },
  {
    semiMajor: 130,
    semiMinor: 110,
    speed: 0.0014,
    size: 3,
    color: "237,189,135",
  },
  {
    semiMajor: 165,
    semiMinor: 140,
    speed: 0.00115,
    size: 3,
    color: "96,165,250",
  },
  {
    semiMajor: 205,
    semiMinor: 170,
    speed: 0.0009,
    size: 2.5,
    color: "239,108,76",
  },
  {
    semiMajor: 260,
    semiMinor: 215,
    speed: 0.00065,
    size: 6,
    color: "241,206,152",
  },
  {
    semiMajor: 320,
    semiMinor: 265,
    speed: 0.00052,
    size: 5,
    color: "129,140,248",
  },
  {
    semiMajor: 380,
    semiMinor: 315,
    speed: 0.00039,
    size: 4,
    color: "253,186,116",
  },
  {
    semiMajor: 440,
    semiMinor: 365,
    speed: 0.00033,
    size: 3.5,
    color: "216,180,254",
  },
];

export const createPlanets = (): Planet[] =>
  PLANETS.map((p) => ({
    ...p,
    phase: Math.random() * Math.PI * 2,
    currentX: 0,
    currentY: 0,
    hoverIntensity: 0,
  }));

export const drawPlanets = (
  ctx: CanvasRenderingContext2D,
  state: GalaxyState,
  alpha: number,
) => {
  const { centerX, centerY, time, planets, planetTrails, mouseX, mouseY } =
    state;
  const rot = time * ORBITAL.systemRotation;
  const cosRot = Math.cos(rot);
  const sinRot = Math.sin(rot);
  const precession =
    Math.sin(time * ORBITAL.precessionSpeed) * ORBITAL.precessionAmount;

  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i];
    const trail = planetTrails[i];
    const angle = planet.phase + time * planet.speed;
    const wobble =
      precession +
      Math.sin(time * ORBITAL.wobbleSpeed + i) * ORBITAL.wobbleAmount;
    const x = planet.semiMajor * Math.cos(angle + wobble);
    const y = planet.semiMinor * Math.sin(angle + wobble);
    const fx = centerX + x * cosRot - y * sinRot;
    const fy = centerY + x * sinRot + y * cosRot;

    planet.currentX = fx;
    planet.currentY = fy;

    const dx = mouseX - fx;
    const dy = mouseY - fy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const targetIntensity = Math.max(0, 1 - dist / ORBITAL.hoverRadius);
    planet.hoverIntensity +=
      (targetIntensity - planet.hoverIntensity) * ORBITAL.hoverLerp;

    trail.push({ x: fx, y: fy, opacity: ORBITAL.trailOpacity });
    if (trail.length > ORBITAL.trailLength) trail.shift();

    for (let j = 0; j < trail.length; j += ORBITAL.trailStep) {
      const pt = trail[j];
      const t = j / trail.length;
      ctx.fillStyle = `rgba(${planet.color},${t * pt.opacity * alpha})`;
      ctx.beginPath();
      ctx.arc(
        pt.x,
        pt.y,
        t * planet.size * ORBITAL.trailSizeScale,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    const hover = planet.hoverIntensity;
    const glowBoost = 1 + hover * ORBITAL.hoverGlowBoost;
    const sizeBoost = 1 + hover * ORBITAL.hoverSizeBoost;

    const gs = planet.size * ORBITAL.glowScale * glowBoost;
    const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, gs);
    const glowAlpha =
      (ORBITAL.glowAlphaBase + hover * ORBITAL.glowAlphaHover) * alpha;
    glow.addColorStop(0, `rgba(${planet.color},${glowAlpha})`);
    glow.addColorStop(
      ORBITAL.glowMidStop,
      `rgba(${planet.color},${glowAlpha * ORBITAL.glowMidAlphaScale})`,
    );
    glow.addColorStop(1, `rgba(${planet.color},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fx, fy, gs, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(fx, fy, planet.size * sizeBoost, 0, Math.PI * 2);
    ctx.fill();
  }
};
