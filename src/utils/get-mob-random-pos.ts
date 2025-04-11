import { Vec2 } from "kaplay";
import { GAME } from "../config";

const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

export default function getMobRandomPos(playerPos: Vec2, radius = 600) {
  const angle = rand(0, Math.PI * 2);
  const distance = rand(radius * 0.8, radius);

  let x = playerPos.x + Math.cos(angle) * distance;
  let y = playerPos.y + Math.sin(angle) * distance;

  x = clamp(x, 0, GAME.MAX_GAME_WIDTH - 60);
  y = clamp(y, 0, GAME.MAX_GAME_HEIGHT - 60);

  return { x, y };
}
