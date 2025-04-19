import { enemyAI } from "../components/enemy-ai";

const initMidEnemy = (x: number, y: number) => {
  return add([
    sprite("mid-enemy", { anim: "float" }),
    pos(x, y),
    body(),
    area({ shape: new Rect(vec2(0, -2), 20, 64) }),
    anchor("center"),
    health(100),
    z(1500),
    state("move", ["idle", "attack", "move", "destroy"]),
    enemyAI({
      bulletColor: [239, 194, 72],
      speed: 80,
      bulletSize: 10,
    }),
    "enemy",
    { bulletDamage: 10, touchDamage: 6, expPoints: 8 },
  ]);
};

export { initMidEnemy };
