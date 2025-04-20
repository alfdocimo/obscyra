import { addFadingNumber } from "../utils/add-fading-text";
import { ENERGY_COLOR, player } from "./player";

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
    opacity(1),
    lifespan(10, { fade: 0.5 }),
    body({ isStatic: true }),
  ]);

  energyOrb.onCollide("player", () => {
    const AMOUNT = amount;

    // Not really damage..
    addFadingNumber({
      number: AMOUNT,
      gameObj: player,
      txtColor: ENERGY_COLOR,
    });

    if (player.energy + AMOUNT >= player.maxEnergy) {
      player.energy = player.maxEnergy;
    } else {
      player.energy += AMOUNT;
    }

    destroy(energyOrb);
  });

  return energyOrb;
}
