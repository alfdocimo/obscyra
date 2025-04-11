const HP = 9999999;
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
    {
      canTakeDamage: true,
      canShoot: true,
      level: 1,
      expPoints: 0,
      nextLevelExpPoints: 10,
      attackDamage: 1,
      attackSpeed: 10,
    },
  ]);

  player.setMaxHP(9999999);

  player.add([
    rect(100, 10),
    pos(-50, -50),
    outline(4),
    color(255, 0, 100),
    anchor("left"),
    "health-bar",
  ]);

  const aimCircle = add([
    pos(toWorld(mousePos())),
    circle(4),
    color(255, 0, 0),
    z(1000),
    "cursor",
  ]);

  aimCircle.onUpdate(() => {
    aimCircle.pos = toWorld(mousePos());
  });

  onMouseDown("left", () => {
    if (!player.exists()) return;

    if (player.canShoot) {
      shootBullet();
      player.canShoot = false;
      wait(1 / player.attackSpeed, () => {
        player.canShoot = true;
      });
    }
  });

  function shootBullet() {
    // Get direction from player to mouse
    const dir = toWorld(mousePos()).sub(player.pos).unit(); // vector from player to mouse, normalized to unit vector

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

      if (obj.target.is("enemy")) {
        playerTakeDamage({ damage: obj.target.touchDamage });
        return; // stop after first valid collision
      }

      if (obj.target.is("bullet")) {
        playerTakeDamage({ damage: obj.target.bulletDamage });
        return; // stop after first valid collision
      }
    }
  });

  player.onUpdate(() => {
    if (player.expPoints >= player.nextLevelExpPoints) {
      player.level += 1;
      player.attackDamage += 1;
      player.setMaxHP(player.maxHP() + 10);
      player.attackSpeed += 1;
      player.expPoints = 0;
      player.nextLevelExpPoints += 10;

      const levelUpText = add([text("Level Up!"), pos(center())]);
      wait(1, () => {
        destroy(levelUpText);
      });
    }
  });

  let statsDebug = add([
    text(
      `Level: ${player.level}\nExp: ${player.expPoints}/${
        player.nextLevelExpPoints
      }\nHP: ${player.hp()}/${player.maxHP()}\nAttack Damage: ${
        player.attackDamage
      }`
    ),
    pos(10, 10),
  ]);
  player.onUpdate(() => {
    statsDebug.text = `Level: ${player.level}\nExp: ${player.expPoints}/${
      player.nextLevelExpPoints
    }\nHP: ${player.hp()}/${player.maxHP()}\nAttack Damage: ${
      player.attackDamage
    }`;
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

  return player;
};

function playerTakeDamage({ damage }: { damage: number }) {
  if (!player.canTakeDamage) return;

  player.canTakeDamage = false;

  shake(20);

  player.hurt(damage);
  player.get("health-bar")[0].width = (player.hp() * 100) / player.maxHP();

  player.use(color(255, 0, 0));

  // Wait for 0.5 seconds, then revert to original color
  wait(1, () => {
    player.use(color(255, 255, 255)); // Revert to white or original color
    player.canTakeDamage = true;
  });
}

export { initPlayer, player };
