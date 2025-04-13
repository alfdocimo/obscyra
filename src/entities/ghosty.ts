import { enemyAI } from "../components/enemy-ai";

const initGhosty = (x: number, y: number) => {
  return add([
    sprite("ghosty", { width: 32, height: 32 }),
    pos(x, y),
    body(),
    anchor("center"),
    area(),
    health(30),
    state("move", ["idle", "attack", "move"]),
    enemyAI({ bulletColor: [244, 0, 0], speed: 100 }),
    "enemy",
    { bulletDamage: 2, touchDamage: 1, expPoints: 1 },
  ]);
};

export { initGhosty };
