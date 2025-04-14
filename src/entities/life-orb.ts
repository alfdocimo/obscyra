import { player } from "./player";

export function initLifeOrb({
  x,
  y,
  amount = 3,
}: {
  amount: number;
  x: number;
  y: number;
}) {
  const lifeOrb = add([
    sprite("life-orb", { width: 25, height: 25, anim: "idle" }),
    pos(x, y),
    anchor("center"),
    area(),
    opacity(3),
    lifespan(10, { fade: 0.5 }),
    body({ isStatic: true }),
  ]);

  lifeOrb.onCollide("player", () => {
    const AMOUNT = amount;

    if (player.hp() + AMOUNT >= player.maxHP()) {
      player.setHP(player.maxHP());
    } else {
      player.heal(AMOUNT);
    }

    destroy(lifeOrb);
  });

  return lifeOrb;
}
