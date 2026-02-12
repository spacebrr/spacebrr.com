import type { GalaxyState, Comet } from "./types";

const COMET = {
  spawnOffset: 10,
  angleBase: Math.PI / 4,
  angleRange: Math.PI / 4,
  sideAngleBase: Math.PI * 0.6,
  sideSpawnHeight: 0.5,
  lengthBase: 30,
  lengthRange: 25,
  speedBase: 0.8,
  speedRange: 0.7,
  opacityBase: 0.2,
  opacityRange: 0.15,
  lifeBase: 80,
  lifeRange: 40,
  fadeStart: 0.7,
  lineWidth: 1.5,
} as const;

export const spawnComet = (state: GalaxyState) => {
  const fromTop = Math.random() < 0.5;
  const comet: Comet = fromTop
    ? {
        x: Math.random() * state.width,
        y: -COMET.spawnOffset,
        angle: COMET.angleBase + Math.random() * COMET.angleRange,
        length: COMET.lengthBase + Math.random() * COMET.lengthRange,
        speed: COMET.speedBase + Math.random() * COMET.speedRange,
        opacity: COMET.opacityBase + Math.random() * COMET.opacityRange,
        life: 0,
        maxLife: COMET.lifeBase + Math.random() * COMET.lifeRange,
      }
    : {
        x: state.width + COMET.spawnOffset,
        y: Math.random() * state.height * COMET.sideSpawnHeight,
        angle: COMET.sideAngleBase + Math.random() * COMET.angleRange,
        length: COMET.lengthBase + Math.random() * COMET.lengthRange,
        speed: COMET.speedBase + Math.random() * COMET.speedRange,
        opacity: COMET.opacityBase + Math.random() * COMET.opacityRange,
        life: 0,
        maxLife: COMET.lifeBase + Math.random() * COMET.lifeRange,
      };
  state.comets.push(comet);
};

export const drawComets = (
  ctx: CanvasRenderingContext2D,
  state: GalaxyState,
  alpha: number,
) => {
  state.comets = state.comets.filter((c) => c.life < c.maxLife);
  for (const c of state.comets) {
    c.x += Math.cos(c.angle) * c.speed;
    c.y += Math.sin(c.angle) * c.speed;
    c.life++;
    const progress = c.life / c.maxLife;
    const fade =
      progress > COMET.fadeStart
        ? 1 - (progress - COMET.fadeStart) / (1 - COMET.fadeStart)
        : 1;
    const tailX = c.x - Math.cos(c.angle) * c.length;
    const tailY = c.y - Math.sin(c.angle) * c.length;
    const grad = ctx.createLinearGradient(tailX, tailY, c.x, c.y);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(1, `rgba(255,255,255,${c.opacity * fade * alpha})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = COMET.lineWidth;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(c.x, c.y);
    ctx.stroke();
  }
};
