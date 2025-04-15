import { enemyAI } from "../components/enemy-ai";

const initGhosty = (x: number, y: number) => {
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
      bulletColor: [244, 0, 0],
      speed: 100,
      bulletSize: 6,
    }),
    "enemy",
    { bulletDamage: 2, touchDamage: 1, expPoints: 1 },
  ]);
};

export { initGhosty };
