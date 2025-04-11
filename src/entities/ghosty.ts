import { enemyAI } from "../components/enemy-ai";

const initGhosty = (x: number, y: number) => {
  return add([
    sprite("ghosty"),
    pos(width() - x, height() - y),
    anchor("center"),
    area(),
    health(30),
    state("move", ["idle", "attack", "move"]),
    enemyAI({ bulletColor: [244, 0, 0], speed: 100 }),
    "enemy",
  ]);
};

export { initGhosty };
