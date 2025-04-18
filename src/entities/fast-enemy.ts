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
    state("move", ["move", "destroy"]),
    enemyAI({
      speed: 220,
    }),
    "enemy",
    { touchDamage: 3, expPoints: 2 },
  ]);
};

export { initFastEnemy };
