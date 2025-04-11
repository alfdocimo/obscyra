import { player, HP as PLAYER_MAX_HP } from "./player";

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
    sprite("heart"),
    pos(x, y),
    anchor("center"),
    area(),
    body({ isStatic: true }),
  ]);

  heart.onCollide("player", () => {
    const HEAL_AMOUNT = healAmount;

    if (player.hp() + HEAL_AMOUNT >= PLAYER_MAX_HP) {
      player.setHP(PLAYER_MAX_HP);
    } else {
      player.heal(HEAL_AMOUNT);
    }
    player.get("health-bar")[0].width = (player.hp() * 100) / PLAYER_MAX_HP;
    destroy(heart);
  });

  return heart;
}
