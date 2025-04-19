import { enemyAI } from "../components/enemy-ai";
import { gameState } from "../game-state";

// function addDamageBasedOnCurrentWave() {
//   return gameState.currentWave ** 2;
// }

// function addExperienceBasedOnCurrentWave() {
//   return gameState.currentWave ** 2;
// }

function scaleEnemyHP(baseHP: number, wave: number): number {
  const hp = baseHP * Math.pow(1.15, wave); // Exponential growth
  return Math.round(hp);
}

function scaleEnemyDamage(baseDamage: number, wave: number): number {
  const damage = baseDamage + wave * 0.8; // Linear growth
  return Math.round(damage);
}

function scaleEnemyXP(baseXP: number, wave: number): number {
  const xp = baseXP + Math.log2(wave + 1); // Logarithmic growth
  return Math.round(xp);
}

const initPerinolaEnemy = (x: number, y: number) => {
  return add([
    sprite("tri-mob", { width: 32, height: 64, anim: "float" }),
    pos(x, y),
    body(),
    area({ shape: new Rect(vec2(0, -8), 16, 32) }),
    anchor("center"),
    health(scaleEnemyHP(30, gameState.currentWave)),
    z(1500),
    state("move", ["idle", "attack", "move", "destroy"]),
    enemyAI({
      bulletColor: [239, 194, 72],
      speed: 100,
      bulletSize: 6,
    }),
    "enemy",
    {
      bulletDamage: scaleEnemyDamage(2, gameState.currentWave),
      touchDamage: scaleEnemyDamage(1, gameState.currentWave),
      expPoints: scaleEnemyXP(2, gameState.currentWave),
    },
  ]);
};

export { initPerinolaEnemy };
