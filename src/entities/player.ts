const HP = 30;
const SPEED = 200;
const BULLET_SPEED = 800;

let player;

const initPlayer = () => {
  player = add([
    sprite("bean"),
    pos(center()),
    area(),
    anchor("center"),
    health(HP),
    "player",
    { canTakeDamage: true, canShoot: true },
  ]);

  player.add([
    rect(100, 10),
    pos(-50, -50),
    outline(4),
    color(255, 0, 100),
    anchor("left"),
    "health-bar",
  ]);

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
      wait(0.01, () => {
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

  player.onUpdate(() => {
    const touching = player.getCollisions();

    for (const obj of touching) {
      if (!player.canTakeDamage) return;

      if (obj.target.is("enemy") || obj.target.is("bullet")) {
        playerTakeDamage();
        return; // stop after first valid collision
      }
    }
  });
  player.on("death", () => {
    destroy(player);
    add([text("lol you suck!?"), pos(center())]);
  });

  // Register input handlers & movement
  onKeyDown("a", () => {
    player.move(-SPEED, 0);
  });

  onKeyDown("d", () => {
    player.move(SPEED, 0);
  });

  onKeyDown("w", () => {
    player.move(0, -SPEED);
  });

  onKeyDown("s", () => {
    player.move(0, SPEED);
  });
};

function playerTakeDamage() {
  if (!player.canTakeDamage) return;

  player.canTakeDamage = false;

  shake(20);

  player.hurt(1);
  player.get("health-bar")[0].width = (player.hp() * 100) / HP;

  player.use(color(255, 0, 0));

  // Wait for 0.5 seconds, then revert to original color
  wait(1, () => {
    player.use(color(255, 255, 255)); // Revert to white or original color
    player.canTakeDamage = true;
  });
}

export { initPlayer, player };
