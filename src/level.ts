import { GAME } from "./config";

export function addWorldBounds() {
  let thickness = 10;
  let worldWidth = GAME.MAX_GAME_WIDTH;
  let worldHeight = GAME.MAX_GAME_HEIGHT;
  add([
    pos(0, 0),
    rect(worldWidth, thickness),
    color(0, 0, 0),
    opacity(0),
    area(),
    body({ isStatic: true }),
    "wall",
  ]);

  // Bottom wall
  add([
    pos(0, worldHeight - thickness),
    rect(worldWidth, thickness),
    color(0, 0, 0),
    opacity(0),
    area(),
    body({ isStatic: true }),
    "wall",
  ]);

  // Left wall
  add([
    pos(0, 0),
    rect(thickness, worldHeight),
    color(0, 0, 0),
    opacity(0),
    area(),
    body({ isStatic: true }),
    "wall",
  ]);

  // Right wall
  add([
    pos(worldWidth - thickness, 0),
    rect(thickness, worldHeight),
    color(0, 0, 0),
    opacity(0),
    area(),
    body({ isStatic: true }),
    "wall",
  ]);
}

export function addBackground() {
  const background = add([
    sprite("level", {
      width: GAME.MAX_GAME_WIDTH,
      height: GAME.MAX_GAME_HEIGHT,
    }),
    pos(0, 0),
    z(-100),
    anchor("topleft"),
    "background",
  ]);
  return background;
}

export function addLevelItems() {
  addLevel(["x x x x x x x x x"], {
    tileWidth: 60,
    tileHeight: 60,
    tiles: {
      x: () => [sprite("steel"), area(), body({ isStatic: true }), "wall"],
    },
  });
}
