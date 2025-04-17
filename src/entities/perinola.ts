import { enemyAI } from "../components/enemy-ai";

const initPerinolaEnemy = (x: number, y: number) => {
  return add([
    sprite("tri-mob", { width: 32, height: 64, anim: "float" }),
    pos(x, y),
    body(),
    area({ shape: new Rect(vec2(0, -8), 16, 32) }),
    anchor("center"),
    health(30),
    z(1500),
    state("move", ["idle", "attack", "move", "destroy"]),
    enemyAI({
      bulletColor: [239, 194, 72],
      speed: 100,
      bulletSize: 6,
    }),
    "enemy",
    { bulletDamage: 2, touchDamage: 1, expPoints: 0.5 },
  ]);
};

export { initPerinolaEnemy };
