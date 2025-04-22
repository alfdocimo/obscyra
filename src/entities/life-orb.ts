import { addFadingNumber, addFadingText } from "../utils/add-fading-text";
import { HP_COLOR, LIGHT_RED, player } from "./player";

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
    opacity(1),
    lifespan(10, { fade: 0.5 }),
    body({ isStatic: true }),
  ]);

  lifeOrb.onCollide("player", () => {
    play("life-orb", { loop: false, volume: 0.3 });

    const AMOUNT = amount;

    addFadingText({
      gameObj: player,
      txt: `+${Math.round(AMOUNT)}`,
      txtColor: LIGHT_RED,
    });

    if (player.hp() + AMOUNT >= player.maxHP()) {
      player.setHP(player.maxHP());
    } else {
      player.heal(AMOUNT);
    }

    destroy(lifeOrb);
  });

  return lifeOrb;
}
