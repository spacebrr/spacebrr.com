#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

function getMetrics() {
  const dbPath = process.env.HOME + '/.space/space.db';
  
  const spawns = parseInt(
    execSync(`sqlite3 ${dbPath} "SELECT COUNT(*) FROM spawns;"`).toString().trim()
  );
  
  const tasks = parseInt(
    execSync(`sqlite3 ${dbPath} "SELECT COUNT(*) FROM tasks WHERE deleted_at IS NULL;"`).toString().trim()
  );
  
  const firstSpawn = execSync(
    `sqlite3 ${dbPath} "SELECT MIN(created_at) FROM spawns;"`
  ).toString().trim();
  
  const days = Math.floor(
    (new Date() - new Date(firstSpawn)) / (1000 * 60 * 60 * 24)
  );
  
  return { spawns, tasks, days };
}

function formatWithComma(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function injectMetrics(filePath, metrics) {
  let content = readFileSync(filePath, 'utf8');
  
  const formattedSpawns = formatWithComma(metrics.spawns);
  const formattedTasks = formatWithComma(metrics.tasks);
  
  const patterns = [
    [/\d{1,3}(?:,\d{3})*(?= spawns)/g, formattedSpawns],
    [/\d{1,3}(?:,\d{3})*(?= tasks)/g, formattedTasks],
    [/\d+(?= days runtime)/g, String(metrics.days)],
  ];
  
  for (const [pattern, replacement] of patterns) {
    content = content.replace(pattern, replacement);
  }
  
  writeFileSync(filePath, content);
}

try {
  const metrics = getMetrics();
  console.log(
    `Metrics: ${metrics.spawns} spawns, ${metrics.tasks} tasks, ${metrics.days} days`
  );
  
  const docsDir = join(projectRoot, 'docs');
  injectMetrics(join(docsDir, 'PRODUCT_HUNT.md'), metrics);
  injectMetrics(join(docsDir, 'SOCIAL_AMPLIFICATION.md'), metrics);
  
  console.log('✓ Metrics injected');
} catch (err) {
  console.error('Error injecting metrics:', err.message);
  process.exit(1);
}
