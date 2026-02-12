export type Star = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  size: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  depth: number;
};

export type Comet = {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
};

export type TrailPoint = { x: number; y: number; opacity: number };
export type Flash = {
  x: number;
  y: number;
  life: number;
  size: number;
  tilt: number;
  alpha: number;
};

export type Planet = {
  semiMajor: number;
  semiMinor: number;
  speed: number;
  phase: number;
  size: number;
  color: string;
  currentX: number;
  currentY: number;
  hoverIntensity: number;
};

export type SpawnNode = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  phase: 'spawning' | 'working' | 'sleeping';
  agentIndex: number;
};

export type GalaxyState = {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  mouseX: number;
  mouseY: number;
  targetMouseX: number;
  targetMouseY: number;
  gravityActive: boolean;
  time: number;
  deltaTime: number;
  stars: Star[];
  flashes: Flash[];
  comets: Comet[];
  planetTrails: TrailPoint[][];
  planets: Planet[];
  spawns: SpawnNode[];
  nebulaSeed: number;
  scrollProgress: number;
};
