import { player } from "./player";

export function initHeart({
  x,
  y,
  healAmount = 3,
}: {
  healAmount: number;
  x: number;
  y: number;
}) {
  const heart = add([
    sprite("heart", { width: 24, height: 24, anim: "idle" }),
    pos(x, y),
    anchor("center"),
    area(),
    opacity(3),
    lifespan(3, { fade: 0.5 }),
    body({ isStatic: true }),
  ]);

  heart.onCollide("player", () => {
    const HEAL_AMOUNT = healAmount;

    if (player.hp() + HEAL_AMOUNT >= player.maxHP()) {
      player.setHP(player.maxHP());
    } else {
      player.heal(HEAL_AMOUNT);
    }
    player.get("health-bar")[0].width = (player.hp() * 50) / player.maxHP();
    destroy(heart);
  });

  return heart;
}
