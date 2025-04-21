import { GAME } from "./config";

export function addWorldBounds() {
  let thickness = 16;
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
  const background = add([sprite("test-map"), z(-100), "background"]);
  return background;
}

export function spawnRandomWalls() {
  const NUM_WALL_CLUSTERS = 30;
  const TILE_SIZE = 60;
  const MAP_WIDTH = GAME.MAX_GAME_WIDTH;
  const MAP_HEIGHT = GAME.MAX_GAME_HEIGHT;
  const GRID_MARGIN = 2;

  const maxGridX = Math.floor(MAP_WIDTH / TILE_SIZE);
  const maxGridY = Math.floor(MAP_HEIGHT / TILE_SIZE);

  const placed = new Set<string>();

  const isTaken = (x: number, y: number) => placed.has(`${x},${y}`);
  const markTaken = (x: number, y: number) => placed.add(`${x},${y}`);

  const placeWall = (gridX: number, gridY: number, spriteName: string) => {
    if (
      isTaken(gridX, gridY) ||
      gridX < GRID_MARGIN ||
      gridY < GRID_MARGIN ||
      gridX >= maxGridX - GRID_MARGIN ||
      gridY >= maxGridY - GRID_MARGIN
    )
      return false;

    const worldX = gridX * TILE_SIZE;
    const worldY = gridY * TILE_SIZE;

    add([
      sprite(spriteName),
      pos(worldX, worldY),
      area(),
      body({ isStatic: true }),
      "wall",
    ]);

    markTaken(gridX, gridY);
    return true;
  };

  for (let i = 0; i < NUM_WALL_CLUSTERS; i++) {
    const clusterType = choose(["single", "square", "rectangle", "line"]);

    const baseX = randi(GRID_MARGIN, maxGridX - GRID_MARGIN);
    const baseY = randi(GRID_MARGIN, maxGridY - GRID_MARGIN);

    // Randomize cluster sprite style
    const clusterStyle = choose(["uniform", "mixed"]);
    const clusterSprite = choose(["steel", "steel-purple"]);

    const getTileSprite = () =>
      clusterStyle === "uniform"
        ? clusterSprite
        : choose(["steel", "steel-purple"]);

    switch (clusterType) {
      case "single":
        placeWall(baseX, baseY, getTileSprite());
        break;

      case "square":
        for (let dx = 0; dx < 2; dx++) {
          for (let dy = 0; dy < 2; dy++) {
            placeWall(baseX + dx, baseY + dy, getTileSprite());
          }
        }
        break;

      case "rectangle":
        const width = randi(2, 5);
        const height = choose([1, 2]);
        for (let dx = 0; dx < width; dx++) {
          for (let dy = 0; dy < height; dy++) {
            placeWall(baseX + dx, baseY + dy, getTileSprite());
          }
        }
        break;

      case "line":
        const isVertical = Math.random() < 0.5;
        const length = randi(2, 5);
        for (let j = 0; j < length; j++) {
          const dx = isVertical ? 0 : j;
          const dy = isVertical ? j : 0;
          placeWall(baseX + dx, baseY + dy, getTileSprite());
        }
        break;
    }
  }
}
