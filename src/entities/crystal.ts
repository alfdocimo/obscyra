import { player } from "./player";

export function initCrystal({ x, y }: { x: number; y: number }) {
  const crystal = add([
    sprite("crystal", { width: 25, height: 25, anim: "idle" }),
    pos(x, y),
    anchor("center"),
    area(),
    opacity(1),
    lifespan(10, { fade: 0.5 }),
    body({ isStatic: true }),
  ]);

  crystal.onCollide("player", () => {
    player.corruption -= 3;
    player.corruptionTimer = 0;
    player.isDecaying = true;

    if (player.corruption <= 0) {
      player.corruption = 0;
      player.isDecaying = false;
      player.corruptionTimer = 0;

      player.enterState("normal");
    }

    destroy(crystal);
  });

  return crystal;
}
