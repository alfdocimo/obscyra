import { player } from "./player";

export function initEnergyOrb({
  x,
  y,
  amount = 3,
}: {
  amount: number;
  x: number;
  y: number;
}) {
  const energyOrb = add([
    sprite("energy-orb", { width: 25, height: 25, anim: "idle" }),
    pos(x, y),
    anchor("center"),
    area(),
    opacity(3),
    lifespan(10, { fade: 0.5 }),
    body({ isStatic: true }),
  ]);

  energyOrb.onCollide("player", () => {
    const AMOUNT = amount;

    if (player.mana + AMOUNT >= player.maxMana) {
      player.mana = player.maxMana;
    } else {
      player.mana += AMOUNT;
    }
    // TODO: when mana UI bar is implemented

    destroy(energyOrb);
  });

  return energyOrb;
}
