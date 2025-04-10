import { GAME } from "../config";

export default function getMobRandomPos() {
  // Randomly choose a side to spawn from
  const side = choose(["top", "bottom", "left", "right"]);

  let x, y;

  switch (side) {
    case "top":
      x = rand(0, GAME.WIDTH);
      y = -50;
      break;
    case "bottom":
      x = rand(0, GAME.WIDTH);
      y = 650;
      break;
    case "left":
      x = -50;
      y = rand(0, GAME.HEIGHT);
      break;
    case "right":
      x = 650;
      y = rand(0, GAME.HEIGHT);
      break;
  }

  return { x, y };
}
