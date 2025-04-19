import { enemyAI } from "../components/enemy-ai";

const MAX_TOTAL_ORBITERS = 6;

export const initHardEnemy = (x: number, y: number) => {
  let hardEnemy = add([
    sprite("hard-enemy", { anim: "float" }),
    pos(x, y),
    body(),
    area({ shape: new Rect(vec2(0, -2), 80, 96) }),
    anchor("center"),
    health(100),
    z(1500),
    state("move", ["idle", "attack", "move", "destroy"]),
    enemyAI({
      bulletColor: [239, 194, 72],
      speed: 80,
      bulletSize: 20,
      isBoss: true,
    }),
    "enemy",
    {
      bulletDamage: 10,
      touchDamage: 15,
      expPoints: 50,
      totalOrbiters: MAX_TOTAL_ORBITERS,
    },
  ]);

  // Initial orbiters
  for (let i = 0; i < MAX_TOTAL_ORBITERS; i++) {
    spawnOrbiter(i, hardEnemy);
  }

  loop(5, () => {
    if (hardEnemy.totalOrbiters < MAX_TOTAL_ORBITERS) {
      let orbitersToSpawn = MAX_TOTAL_ORBITERS - hardEnemy.totalOrbiters;

      for (let i = 0; i < orbitersToSpawn; i++) {
        spawnOrbiter(i, hardEnemy);
      }
    }
  });

  return hardEnemy;
};
function spawnOrbiter(i: number, hardEnemy) {
  const initialAngle = (Math.PI * 2 * i) / 12;
  const baseRadius = rand(50, 90);
  const angleSpeed = rand(3, 6); // radians/sec
  const radiusVariation = rand(60, 90);

  let orbiter = hardEnemy.add([
    sprite("hard-enemy-osc", { width: 16, height: 16 }),
    pos(0, 0), // relative to the hardEnemy

    anchor("center"),
    color(239, 194, 72),
    area({
      collisionIgnore: ["hard-enemy-osc"],
    }),
    z(1000), // render just above the enemy
    "hard-enemy-osc",
    {
      bulletDamage: 10,
      angle: initialAngle,
      baseRadius,
      radiusVariation,
      angleSpeed,
      time: 0,
      update() {
        this.time += dt();

        // Pulsating radius
        const radius =
          this.baseRadius + Math.sin(this.time * 2) * this.radiusVariation;

        // Angle rotation
        this.angle += this.angleSpeed * dt();

        // Set position relative to parent (hardEnemy)
        const offset = vec2(
          Math.cos(this.angle) * radius,
          Math.sin(this.angle) * radius
        );

        this.pos = offset;
      },
    },
  ]);

  orbiter.onCollide("player-bullet", (playerBullet) => {
    orbiter.destroy();
    hardEnemy.totalOrbiters -= 1;
  });

  orbiter.onCollide("player-moving-bullet", (playerBullet) => {
    orbiter.destroy();
    hardEnemy.totalOrbiters -= 1;
  });

  orbiter.onCollide("player-final-shot-bullet", (playerBullet) => {
    orbiter.destroy();
    hardEnemy.totalOrbiters -= 1;
  });

  orbiter.onCollide("player-slash", (playerBullet) => {
    orbiter.destroy();
    hardEnemy.totalOrbiters -= 1;
  });

  orbiter.onCollide("player-long-slash", (playerBullet) => {
    orbiter.destroy();
    hardEnemy.totalOrbiters -= 1;
  });

  orbiter.onCollide("player-circle-slash", (playerBullet) => {
    orbiter.destroy();
    hardEnemy.totalOrbiters -= 1;
  });
}
