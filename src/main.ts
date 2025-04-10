import kaplay from "kaplay";
import "kaplay/global";
import { initPlayer, player } from "./entities/player";
import { initEnemy } from "./entities/enemy";

// @ts-check

// Use state() component to handle basic AI

const GAME = {
  HEIGHT: 600,
  WIDTH: 600,
};

kaplay({
  root: document.querySelector("#game-container"),
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  scale: 1,
  background: [0, 0, 0],
});

loadSprite("bean", "/sprites/bean.png");
loadSprite("ghosty", "/sprites/ghosty.png");

const SPEED = 320;
const ENEMY_SPEED = 160;
const BULLET_SPEED = 800;

const HP = 30;

initPlayer();

const aimCircle = add([
  circle(8), // circle with radius 8
  pos(0, 0), // initial position doesn't matter, it's going to follow the mouse
  color(255, 0, 0), // red color
  anchor("center"), // anchor to center, so it follows the mouse cleanly
]);

aimCircle.onUpdate(() => {
  aimCircle.pos = mousePos();
});

onMouseDown("left", () => {
  if (player.canShoot) {
    shootBullet();
    player.canShoot = false;
    wait(0.3, () => {
      player.canShoot = true;
    });
  }
});

function shootBullet() {
  // Get direction from player to mouse
  const dir = mousePos().sub(player.pos).unit(); // vector from player to mouse, normalized to unit vector

  // Create bullet
  add([
    rect(12, 12), // bullet shape (12x12)
    pos(player.pos), // spawn it at the player's position
    move(dir, BULLET_SPEED * 1.5), // move in the direction of the mouse with BULLET_SPEED
    area(),
    anchor("center"),
    offscreen({ destroy: true }),
    color(0, 255, 255), // blue bullet color
    "player-bullet", // tag for bullet (useful for collision detection)
  ]);
}

loop(2, () => {
  if (!player.exists()) return;

  let { x, y } = getMobRandomPos();
  let enemy = initEnemy(x, y);
});

// Taking a bullet makes us disappear
// player.onCollide("bullet", (bullet) => {
//     playerTakeDamage();
// });

// player.onCollide('enemy',()=>{
//    playerTakeDamage();
// })

function getMobRandomPos() {
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
