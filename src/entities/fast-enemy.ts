import { enemyAI } from "../components/enemy-ai";
import {
  scaleEnemyDamage,
  scaleEnemyHP,
  scaleEnemyXP,
} from "../utils/scale-enemy-stats";

const initFastEnemy = (x: number, y: number) => {
  return add([
    sprite("fast-enemy", { anim: "float" }),
    pos(x, y),
    body(),
    area({ shape: new Rect(vec2(0, -2), 16, 32) }),
    anchor("center"),
    health(scaleEnemyHP(10)),
    z(1500),
    state("move", ["move", "idle", "attack", "destroy"]),
    enemyAI({
      bulletColor: [239, 194, 72],
      speed: 100,
      bulletSize: 6,
      hurtSound: "perinola-shoot",
      shootSound: "hurt-perinola",
    }),
    "enemy",
    {
      bulletDamage: scaleEnemyDamage(1),
      touchDamage: scaleEnemyDamage(1),
      expPoints: scaleEnemyXP(2),
    },
  ]);
};

export { initFastEnemy };
