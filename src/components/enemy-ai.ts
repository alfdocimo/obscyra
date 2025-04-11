import {
  GameObj,
  PosComp,
  StateComp,
  HealthComp,
  AreaComp,
  AnchorComp,
} from "kaplay";
import { player } from "../entities/player";

type EnemyAIConfig = {
  bulletColor?: [number, number, number];
  attackDuration?: number;
  moveDuration?: number;
  idleDuration?: number;
  bulletSpeed?: number;
  bulletSize?: number;
  speed?: number;
};

export function enemyAI(config: EnemyAIConfig = {}) {
  let initialHealth = undefined;

  return {
    id: "enemyAI",

    require: ["pos", "state", "health", "area", "anchor"],

    add(
      this: GameObj<PosComp | StateComp | HealthComp | AreaComp | AnchorComp>
    ) {
      const self = this;

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
      const speed = config.speed ?? 200;
      const bulletSpeed = config.bulletSpeed ?? 800;
      const bulletSize = config.bulletSize ?? 12;

      self.onStateEnter("idle", async () => {
        await wait(idleDuration);
        self.enterState("attack");
      });

      self.onStateEnter("attack", async () => {
        const p = player;
        if (p.exists() && self.exists()) {
          const dir = p.pos.sub(self.pos).unit();

          add([
            pos(self.pos),
            move(dir, bulletSpeed),
            rect(bulletSize, bulletSize),
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
        const p = player;
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
