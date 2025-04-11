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

export function spawnRandomWalls() {
  const NUM_WALL_CLUSTERS = 30;
  const TILE_SIZE = 60;
  const MAP_WIDTH = GAME.MAX_GAME_WIDTH;
  const MAP_HEIGHT = GAME.MAX_GAME_HEIGHT;

  // Track placed grid positions
  const placed = new Set<string>();

  // Helper to check if a tile is taken
  const isTaken = (x: number, y: number) => placed.has(`${x},${y}`);
  const markTaken = (x: number, y: number) => placed.add(`${x},${y}`);

  // Helper to place a wall only if not taken
  const placeWall = (gridX: number, gridY: number) => {
    if (isTaken(gridX, gridY)) return false;

    const worldX = gridX * TILE_SIZE;
    const worldY = gridY * TILE_SIZE;

    add([
      sprite("steel"),
      pos(worldX, worldY),
      area(),
      body({ isStatic: true }),
      "wall",
    ]);

    markTaken(gridX, gridY);
    return true;
  };

  // Loop and place clusters
  for (let i = 0; i < NUM_WALL_CLUSTERS; i++) {
    const clusterType = choose(["single", "square", "rectangle", "line"]);

    const maxGridX = Math.floor(MAP_WIDTH / TILE_SIZE);
    const maxGridY = Math.floor(MAP_HEIGHT / TILE_SIZE);
    const baseX = randi(0, maxGridX);
    const baseY = randi(0, maxGridY);

    switch (clusterType) {
      case "single":
        placeWall(baseX, baseY);
        break;

      case "square":
        for (let dx = 0; dx < 2; dx++) {
          for (let dy = 0; dy < 2; dy++) {
            placeWall(baseX + dx, baseY + dy);
          }
        }
        break;

      case "rectangle":
        const width = randi(2, 5); // 2 to 4
        const height = choose([1, 2]);
        for (let dx = 0; dx < width; dx++) {
          for (let dy = 0; dy < height; dy++) {
            placeWall(baseX + dx, baseY + dy);
          }
        }
        break;

      case "line":
        const isVertical = Math.random() < 0.5;
        const length = randi(2, 5);
        for (let j = 0; j < length; j++) {
          const dx = isVertical ? 0 : j;
          const dy = isVertical ? j : 0;
          placeWall(baseX + dx, baseY + dy);
        }
        break;
    }
  }
}
