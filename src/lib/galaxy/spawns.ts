import type { GalaxyState } from "./types";

const SPAWN_CONFIG = {
  spawnRate: 0.015,
  maxSpawns: 12,
  lifetimeMin: 180,
  lifetimeMax: 360,
  sizeMin: 2.5,
  sizeMax: 5,
  speed: 0.8,
  arrivalDist: 8,
} as const;

const AGENT_COLORS = [
  "rgba(147, 197, 253, 0.9)",
  "rgba(134, 239, 172, 0.9)",
  "rgba(252, 211, 77, 0.9)",
  "rgba(251, 146, 60, 0.9)",
  "rgba(244, 114, 182, 0.9)",
  "rgba(196, 181, 253, 0.9)",
  "rgba(165, 243, 252, 0.9)",
  "rgba(190, 242, 100, 0.9)",
];

export const spawnSpawnNode = (state: GalaxyState): void => {
  const { width, height, centerX, centerY, spawns } = state;
  
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.max(width, height) * 0.6;
  const targetX = centerX + Math.cos(angle) * radius;
  const targetY = centerY + Math.sin(angle) * radius;
  
  const agentIndex = Math.floor(Math.random() * AGENT_COLORS.length);
  
  spawns.push({
    x: centerX,
    y: centerY,
    targetX,
    targetY,
    vx: 0,
    vy: 0,
    size: SPAWN_CONFIG.sizeMin + Math.random() * (SPAWN_CONFIG.sizeMax - SPAWN_CONFIG.sizeMin),
    color: AGENT_COLORS[agentIndex],
    life: SPAWN_CONFIG.lifetimeMin + Math.random() * (SPAWN_CONFIG.lifetimeMax - SPAWN_CONFIG.lifetimeMin),
    maxLife: SPAWN_CONFIG.lifetimeMin + Math.random() * (SPAWN_CONFIG.lifetimeMax - SPAWN_CONFIG.lifetimeMin),
    phase: 'spawning',
    agentIndex,
  });
};

export const updateSpawns = (state: GalaxyState): void => {
  const { deltaTime, centerX, centerY, spawns } = state;
  
  for (const spawn of spawns) {
    spawn.life -= deltaTime;
    
    const dx = spawn.targetX - spawn.x;
    const dy = spawn.targetY - spawn.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (spawn.phase === 'spawning') {
      if (dist > SPAWN_CONFIG.arrivalDist) {
        spawn.vx = (dx / dist) * SPAWN_CONFIG.speed;
        spawn.vy = (dy / dist) * SPAWN_CONFIG.speed;
        spawn.x += spawn.vx * deltaTime;
        spawn.y += spawn.vy * deltaTime;
      } else {
        spawn.phase = 'working';
        const workAngle = Math.random() * Math.PI * 2;
        const workRadius = Math.random() * 60 + 40;
        spawn.targetX = spawn.x + Math.cos(workAngle) * workRadius;
        spawn.targetY = spawn.y + Math.sin(workAngle) * workRadius;
      }
    } else if (spawn.phase === 'working') {
      if (spawn.life < spawn.maxLife * 0.2) {
        spawn.phase = 'sleeping';
        spawn.targetX = centerX;
        spawn.targetY = centerY;
      } else {
        spawn.x += Math.sin(state.time * 0.01 + spawn.agentIndex) * 0.3;
        spawn.y += Math.cos(state.time * 0.01 + spawn.agentIndex) * 0.3;
        
        if (Math.random() < 0.003 * deltaTime) {
          const workAngle = Math.random() * Math.PI * 2;
          const workRadius = Math.random() * 60 + 40;
          spawn.targetX = spawn.x + Math.cos(workAngle) * workRadius;
          spawn.targetY = spawn.y + Math.sin(workAngle) * workRadius;
        }
      }
    } else if (spawn.phase === 'sleeping') {
      if (dist > SPAWN_CONFIG.arrivalDist) {
        spawn.vx = (dx / dist) * SPAWN_CONFIG.speed * 1.5;
        spawn.vy = (dy / dist) * SPAWN_CONFIG.speed * 1.5;
        spawn.x += spawn.vx * deltaTime;
        spawn.y += spawn.vy * deltaTime;
      }
    }
  }
  
  state.spawns = spawns.filter(s => s.life > 0);
};

export const drawSpawns = (
  ctx: CanvasRenderingContext2D,
  state: GalaxyState,
  alpha: number,
): void => {
  for (const spawn of state.spawns) {
    const fadeAlpha = spawn.phase === 'sleeping' 
      ? Math.min(1, spawn.life / (spawn.maxLife * 0.2))
      : Math.min(1, (spawn.maxLife - spawn.life) / (spawn.maxLife * 0.1));
    
    const finalAlpha = alpha * fadeAlpha;
    
    ctx.fillStyle = spawn.color.replace('0.9', String(finalAlpha * 0.9));
    ctx.beginPath();
    ctx.arc(spawn.x, spawn.y, spawn.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = spawn.color.replace('0.9', String(finalAlpha * 0.3));
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(spawn.x, spawn.y, spawn.size + 2, 0, Math.PI * 2);
    ctx.stroke();
    
    if (spawn.phase === 'working') {
      const pulseSize = spawn.size + Math.sin(state.time * 0.1) * 1.5;
      ctx.strokeStyle = spawn.color.replace('0.9', String(finalAlpha * 0.15));
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(spawn.x, spawn.y, pulseSize + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
};
