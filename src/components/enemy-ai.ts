import {
  GameObj,
  PosComp,
  StateComp,
  HealthComp,
  AreaComp,
  AnchorComp,
} from "kaplay";
import {
  getSelectedMeleeSkillDamage,
  getSelectedRangedSkillDamage,
  player,
} from "../entities/player";
import { initHeart } from "../entities/heart";

type EnemyAIConfig = {
  bulletColor?: [number, number, number];
  attackDuration?: number;
  moveDuration?: number;
  idleDuration?: number;
  bulletSpeed?: number;
  bulletSize?: number;
  speed?: number;
};

type EnemyAIContext = GameObj<
  | PosComp
  | StateComp
  | HealthComp
  | AreaComp
  | AnchorComp
  | { expPoints: number }
>;

export function enemyAI(config: EnemyAIConfig = {}) {
  let initialHealth = undefined;

  return {
    id: "enemyAI",

    require: ["pos", "state", "health", "area", "anchor"],

    add(this: EnemyAIContext) {
      const self = this;

      initialHealth = self.hp();

      // Create health bar
      const hpBar = self.add([
        rect(50, 5),
        pos(-25, -25),
        outline(1),
        color(255, 0, 100),
        anchor("left"),
        "enemy-health-bar",
      ]);

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

          let enemyBullet = add([
            pos(self.pos),
            move(dir, bulletSpeed),
            rect(bulletSize, bulletSize),
            area(),
            offscreen({ destroy: true }),
            anchor("center"),
            color(bulletColor),
            "bullet",
          ]);

          enemyBullet.onCollide("player", () => {
            destroy(enemyBullet);
          });

          enemyBullet.onCollide("wall", () => {
            destroy(enemyBullet);
          });
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

      self.onCollide("player-bullet", (playerBullet) => {
        destroy(playerBullet);
        takeDamageFromSkill("ranged");
      });

      self.onCollide("player-slash", (playerBullet) => {
        takeDamageFromSkill("melee");
      });

      self.onUpdate(() => {
        const DIST_LIMIT = 1200;
        if (self.pos.dist(player.pos) > DIST_LIMIT) {
          destroy(self);
        }
      });

      function takeDamageFromSkill(skillType: "ranged" | "melee") {
        if (skillType === "ranged") {
          let damage = getSelectedRangedSkillDamage();
          self.hurt(damage);
        }
        if (skillType === "melee") {
          let damage = getSelectedMeleeSkillDamage();
          self.hurt(damage);
        }

        if (self.hp() <= 0) {
          destroy(self);
          return;
        }

        hpBar.width = (self.hp() * 50) / initialHealth;

        self.use(color(255, 0, 0));
        wait(0.05, () => {
          self.use(color(255, 255, 255));
        });
      }
    },

    destroy(this: EnemyAIContext) {
      const self = this;
      const willDropHeart = rand(100);
      if (willDropHeart > 50) {
        initHeart({
          x: this.pos.x,
          y: this.pos.y,
          healAmount: 3,
        });
      }

      player.expPoints += self.expPoints;
    },
  };
}
