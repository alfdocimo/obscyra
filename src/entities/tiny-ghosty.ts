import { enemyAI } from "../components/enemy-ai";

const initTinyGhosty = (x: number, y: number) => {
  return add([
    sprite("tiny-ghosty"),
    pos(x, y),
    anchor("center"),
    area(),
    health(15),
    state("move", ["idle", "attack", "move"]),
    enemyAI({
      bulletColor: [244, 0, 0],
      speed: 200,
      bulletSize: 6,
      idleDuration: 0.3,
      attackDuration: 0.3,
      moveDuration: 3,
      bulletSpeed: 800,
    }),
    "enemy",
    { bulletDamage: 1, touchDamage: 1, expPoints: 0.5 },
  ]);
};

export { initTinyGhosty };
