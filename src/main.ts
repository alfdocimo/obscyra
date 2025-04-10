import kaplay from "kaplay";
import "kaplay/global";

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

loadRoot(".");
// Load assets
loadSprite("bean", "/sprites/bean.png");
loadSprite("ghosty", "/sprites/ghosty.png");

const SPEED = 320;
const ENEMY_SPEED = 160;
const BULLET_SPEED = 800;

const HP = 30;

// Add player game object
const player = add([
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

  const enemy = add([
    health(3),
    sprite("ghosty"),
    pos(width() - x, height() - y),
    anchor("center"),
    area(),
    color(),
    // This enemy cycle between 3 states, and start from "idle" state
    state("move", ["idle", "attack", "move"]),
    "enemy",
    animate(),
  ]);

  enemy.add([
    rect(100, 10),
    pos(-50, -50),
    outline(4),
    color(255, 0, 100),
    anchor("left"),
    "enemy-health-bar",
  ]);

  // Run the callback once every time we enter "idle" state.
  // Here we stay "idle" for 0.5 second, then enter "attack" state.
  enemy.onStateEnter("idle", async () => {
    await wait(0.5);
    enemy.enterState("attack");
  });

  // When we enter "attack" state, we fire a bullet, and enter "move" state after 1 sec
  enemy.onStateEnter("attack", async () => {
    // Don't do anything if player doesn't exist anymore
    if (player.exists() && enemy.exists()) {
      const dir = player.pos.sub(enemy.pos).unit();

      let bullet = add([
        pos(enemy.pos),
        move(dir, BULLET_SPEED),
        rect(12, 12),
        area(),
        offscreen({ destroy: true }),
        anchor("center"),
        color(BLUE),
        "bullet",
      ]);
    }

    // Waits 1 second to make the enemy enter in "move" state
    await wait(1);
    enemy.enterState("move");
  });

  // When we enter "move" state, we stay there for 2 sec and then go back to "idle"
  enemy.onStateEnter("move", async () => {
    await wait(2);
    enemy.enterState("idle");
  });

  // .onStateUpdate() is similar to .onUpdate(), it'll run every frame, but in this case
  // Only when the current state is "move"
  enemy.onStateUpdate("move", () => {
    // We move the enemy in the direction of the player
    if (!player.exists()) return;
    const dir = player.pos.sub(enemy.pos).unit();
    enemy.move(dir.scale(ENEMY_SPEED));
  });

  enemy.onCollide("player-bullet", () => {
    enemy.hurt(1);

    if (enemy.hp() === 0) {
      destroy(enemy);
      return;
    }

    // enemy.use(color(255, 0, 0));
    enemy.get("enemy-health-bar")[0].width = (enemy.hp() * 100) / 3;

    // wait(0.05,()=>{
    //     enemy.use(color(255, 255, 255)); // Revert to white or original color

    // })
  });
});

// Taking a bullet makes us disappear
// player.onCollide("bullet", (bullet) => {
//     playerTakeDamage();
// });

// player.onCollide('enemy',()=>{
//    playerTakeDamage();
// })

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
