import { enemyAI } from "../components/enemy-ai";

const initFastEnemy = (x: number, y: number) => {
  return add([
    sprite("fast-enemy", { anim: "float" }),
    pos(x, y),
    body(),
    area({ shape: new Rect(vec2(0, -2), 16, 32) }),
    anchor("center"),
    health(10),
    z(1500),
    state("move", ["move", "idle", "attack", "destroy"]),
    enemyAI({
      bulletColor: [239, 194, 72],
      speed: 100,
      bulletSize: 6,
    }),
    "enemy",
    { bulletDamage: 1, touchDamage: 1, expPoints: 1 },
  ]);
};

export { initFastEnemy };
