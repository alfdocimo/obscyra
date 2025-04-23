import { enemyAI } from "../components/enemy-ai";
import { gameState } from "../game-state";
import {
  scaleEnemyDamage,
  scaleEnemyHP,
  scaleEnemyXP,
} from "../utils/scale-enemy-stats";

const initNormalEnemy = (x: number, y: number) => {
  return add([
    sprite("tri-mob", { width: 32, height: 64, anim: "float" }),
    pos(x, y),
    body(),
    area({ shape: new Rect(vec2(0, 0), 24, 60) }),
    anchor("center"),
    health(scaleEnemyHP(30)),
    z(1500),
    state("move", ["idle", "attack", "move", "destroy"]),
    enemyAI({
      bulletColor: [239, 194, 72],
      speed: 100,
      bulletSize: 6,
      hurtSound: "perinola-shoot",
      shootSound: "hurt-perinola",
    }),
    "enemy",
    {
      bulletDamage: scaleEnemyDamage(2),
      touchDamage: scaleEnemyDamage(1),
      expPoints: scaleEnemyXP(2),
    },
  ]);
};

export { initNormalEnemy };
