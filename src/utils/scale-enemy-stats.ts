import { gameState } from "../game-state";

export function scaleEnemyHP(baseHP: number): number {
  const hp = baseHP * Math.pow(1.15, gameState.currentWave);
  return Math.round(hp);
}

export function scaleEnemyDamage(baseDamage: number): number {
  const damage = baseDamage + gameState.currentWave * 0.8;
  return Math.round(damage);
}

export function scaleEnemyXP(baseXP: number): number {
  const xp = baseXP + Math.log2(gameState.currentWave + 1);
  return Math.round(xp);
}
