import { enemyAI } from "../components/enemy-ai";

const initGigagantrum = (x: number, y: number) => {
  return add([
    sprite("gigagantrum"),
    pos(width() - x, height() - y),
    anchor("center"),
    area(),
    health(200),
    state("move", ["idle", "attack", "move"]),
    enemyAI({
      bulletColor: [244, 200, 50],
      bulletSpeed: 400,
      attackDuration: 1,
      moveDuration: 2,
      idleDuration: 3,
      speed: 50,
      bulletSize: 30,
    }),
    "enemy",
    { bulletDamage: 7, touchDamage: 15, expPoints: 10 },
  ]);
};

export { initGigagantrum };
