import { player } from "./player";

export function initEnergyOrb({
  x,
  y,
  healAmount = 3,
}: {
  healAmount: number;
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
    const HEAL_AMOUNT = healAmount;

    if (player.hp() + HEAL_AMOUNT >= player.maxHP()) {
      player.setHP(player.maxHP());
    } else {
      player.heal(HEAL_AMOUNT);
    }
    player.get("health-bar")[0].width = (player.hp() * 50) / player.maxHP();
    destroy(energyOrb);
  });

  return energyOrb;
}
