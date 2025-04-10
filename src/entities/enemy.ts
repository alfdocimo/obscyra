const ENEMY_SPEED = 160;
const BULLET_SPEED = 800;

const initEnemy = (x: number, y: number) => {
  let player = get("player")[0];

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

    enemy.get("enemy-health-bar")[0].width = (enemy.hp() * 100) / 3;

    enemy.use(color(255, 0, 0));

    wait(0.05, () => {
      enemy.use(color(255, 255, 255));
    });
  });
};

export { initEnemy };
