import { GameObj } from "kaplay";

const ENEMY_SPEED = 160;
const BULLET_SPEED = 800;

const initEnemy = (x: number, y: number) => {
  return add([
    sprite("ghosty"),
    pos(width() - x, height() - y),
    anchor("center"),
    area(),
    color(),
    health(30),
    state("move", ["idle", "attack", "move"]),
    animate(),
    enemyAI({ bulletColor: [244, 0, 0] }), // You can customize!
    "enemy",
  ]);
};

export { initEnemy };

type EnemyAIConfig = {
  bulletColor?: [number, number, number];
  attackDuration?: number;
  moveDuration?: number;
  idleDuration?: number;
  speed?: number;
};

export function enemyAI(config: EnemyAIConfig = {}) {
  let initialHealth = undefined;

  return {
    id: "enemyAI",

    require: ["pos", "state", "health", "area", "anchor"],

    add() {
      const self = this as ReturnType<typeof initEnemy>;

      // Create health bar
      const hpBar = self.add([
        rect(100, 10),
        pos(-50, -50),
        outline(4),
        color(255, 0, 100),
        anchor("left"),
        "enemy-health-bar",
      ]);

      initialHealth = self.hp();

      const bulletColor = config.bulletColor ?? [0, 255, 255];
      const attackDuration = config.attackDuration ?? 1;
      const moveDuration = config.moveDuration ?? 2;
      const idleDuration = config.idleDuration ?? 0.5;
      const speed = config.speed ?? ENEMY_SPEED;

      let player = () => get("player")[0];

      self.onStateEnter("idle", async () => {
        await wait(idleDuration);
        self.enterState("attack");
      });

      self.onStateEnter("attack", async () => {
        const p = player();
        if (p && self.exists()) {
          const dir = p.pos.sub(self.pos).unit();

          add([
            pos(self.pos),
            move(dir, BULLET_SPEED),
            rect(12, 12),
            area(),
            offscreen({ destroy: true }),
            anchor("center"),
            color(bulletColor),
            "bullet",
          ]);
        }

        await wait(attackDuration);
        self.enterState("move");
      });

      self.onStateEnter("move", async () => {
        await wait(moveDuration);
        self.enterState("idle");
      });

      self.onStateUpdate("move", () => {
        const p = player();
        if (!p?.exists()) return;
        const dir = p.pos.sub(self.pos).unit();
        self.move(dir.scale(speed));
      });

      self.onCollide("player-bullet", () => {
        self.hurt(1);

        if (self.hp() === 0) {
          destroy(self);
          return;
        }

        hpBar.width = (self.hp() * 100) / initialHealth;

        self.use(color(255, 0, 0));
        wait(0.05, () => {
          self.use(color(255, 255, 255));
        });
      });
    },
  };
}
