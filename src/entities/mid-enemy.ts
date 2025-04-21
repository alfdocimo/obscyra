import { enemyAI } from "../components/enemy-ai";
import {
  scaleEnemyDamage,
  scaleEnemyHP,
  scaleEnemyXP,
} from "../utils/scale-enemy-stats";

const initMidEnemy = (x: number, y: number) => {
  return add([
    sprite("mid-enemy", { anim: "float" }),
    pos(x, y),
    body(),
    area({ shape: new Rect(vec2(0, -2), 20, 64) }),
    anchor("center"),
    health(scaleEnemyHP(50)),
    z(1500),
    state("move", ["idle", "attack", "move", "destroy"]),
    enemyAI({
      bulletColor: [239, 194, 72],
      speed: 80,
      bulletSize: 10,
      hurtSound: "perinola-shoot",
      shootSound: "hurt-perinola",
    }),
    "enemy",
    {
      bulletDamage: scaleEnemyDamage(10),
      touchDamage: scaleEnemyDamage(6),
      expPoints: scaleEnemyXP(8),
    },
  ]);
};

export { initMidEnemy };
