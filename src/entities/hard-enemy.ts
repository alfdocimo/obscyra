import { enemyAI } from "../components/enemy-ai";
import {
  scaleEnemyDamage,
  scaleEnemyHP,
  scaleEnemyXP,
} from "../utils/scale-enemy-stats";

const MAX_TOTAL_ORBITERS = 6;

export const initHardEnemy = (x: number, y: number) => {
  let hardEnemy = add([
    sprite("hard-enemy", { anim: "float" }),
    pos(x, y),
    body(),
    area({ shape: new Rect(vec2(0, -2), 80, 96) }),
    anchor("center"),
    health(scaleEnemyHP(100)),
    z(1500),
    state("move", ["idle", "attack", "laser-beam-attack", "move", "destroy"]),
    enemyAI({
      bulletColor: [239, 194, 72],
      speed: 120,
      bulletSize: 20,
      isBoss: true,
      hurtSound: "perinola-shoot",
      shootSound: "hurt-perinola",
    }),
    "enemy",
    {
      bulletDamage: scaleEnemyDamage(22),
      touchDamage: scaleEnemyDamage(15),
      expPoints: scaleEnemyXP(20),
      totalOrbiters: MAX_TOTAL_ORBITERS,
    },
  ]);

  for (let i = 0; i < MAX_TOTAL_ORBITERS; i++) {
    spawnOrbiter(i, hardEnemy);
  }

  return hardEnemy;
};
function spawnOrbiter(i: number, hardEnemy) {
  const initialAngle = (Math.PI * 2 * i) / 12;
  const baseRadius = rand(50, 90);
  const angleSpeed = rand(3, 6);
  const radiusVariation = rand(60, 90);

  let orbiter = hardEnemy.add([
    sprite("hard-enemy-osc", { width: 16, height: 16 }),
    pos(0, 0),

    anchor("center"),
    color(239, 194, 72),
    area({ collisionIgnore: ["hard-enemy-osc", "enemy", "bullet"] }),
    z(1000),
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

        const radius =
          this.baseRadius + Math.sin(this.time * 2) * this.radiusVariation;

        this.angle += this.angleSpeed * dt();

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
    let interval = randi(3, 10);
    wait(interval, () => {
      spawnOrbiter(interval, hardEnemy);
    });
  });

  orbiter.onCollide("player-moving-bullet", (playerBullet) => {
    orbiter.destroy();
    hardEnemy.totalOrbiters -= 1;
    let interval = randi(3, 10);
    wait(interval, () => {
      spawnOrbiter(interval, hardEnemy);
    });
  });

  orbiter.onCollide("player-final-shot-bullet", (playerBullet) => {
    orbiter.destroy();
    hardEnemy.totalOrbiters -= 1;
    let interval = randi(3, 10);
    wait(interval, () => {
      spawnOrbiter(interval, hardEnemy);
    });
  });

  orbiter.onCollide("player-slash", (playerBullet) => {
    orbiter.destroy();
    hardEnemy.totalOrbiters -= 1;
    let interval = randi(3, 10);
    wait(interval, () => {
      spawnOrbiter(interval, hardEnemy);
    });
  });

  orbiter.onCollide("player-long-slash", (playerBullet) => {
    orbiter.destroy();
    hardEnemy.totalOrbiters -= 1;
    let interval = randi(3, 10);
    wait(interval, () => {
      spawnOrbiter(interval, hardEnemy);
    });
  });

  orbiter.onCollide("player-circle-slash", (playerBullet) => {
    orbiter.destroy();
    hardEnemy.totalOrbiters -= 1;
    let interval = randi(3, 10);
    wait(interval, () => {
      spawnOrbiter(interval, hardEnemy);
    });
  });
}
