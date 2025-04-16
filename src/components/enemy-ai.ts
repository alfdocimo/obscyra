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
import { initCrystal } from "../entities/crystal";
import { gameState } from "../game-state";
import { initLifeOrb } from "../entities/life-orb";
import { initEnergyOrb } from "../entities/energy-orb";

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
  | { expPoints: number; bulletDamage: number }
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
        pos(-25, -45),
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
            { bulletDamage: self.bulletDamage },
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

      self.onStateEnter("destroy", () => {
        let flashCount = 0;
        const maxFlashes = 4;
        const flashInterval = 0.1;

        const flashTimer = loop(flashInterval, () => {
          self.use(
            color(flashCount % 2 === 0 ? rgb(255, 0, 0) : rgb(255, 255, 255))
          );

          flashCount++;

          if (flashCount >= maxFlashes) {
            flashTimer.cancel();
            die();
          }
        });
      });

      self.onCollide("player-bullet", (playerBullet) => {
        destroy(playerBullet);
        takeDamageFromSkill("ranged");
      });

      self.onCollide("player-moving-bullet", (playerBullet) => {
        takeDamageFromSkill("ranged");
      });

      self.onCollide("player-slash", (playerBullet) => {
        takeDamageFromSkill("melee");
      });

      self.onCollide("player-long-slash", (playerBullet) => {
        takeDamageFromSkill("melee");
      });

      self.onCollide("player-circle-slash", (playerBullet) => {
        takeDamageFromSkill("melee");
      });

      self.onUpdate(() => {
        const DIST_LIMIT = 1200;
        if (self.pos.dist(player.pos) > DIST_LIMIT) {
          removeOutOfBounds();
        }
      });

      function takeDamageFromSkill(skillType: "ranged" | "melee") {
        let playerCorruption = player.corruption;
        let damageToTakeAmount = 1;

        if (skillType === "ranged") {
          damageToTakeAmount =
            getSelectedRangedSkillDamage() + playerCorruption * 1.5;
          self.hurt(damageToTakeAmount);
        }
        if (skillType === "melee") {
          damageToTakeAmount =
            getSelectedMeleeSkillDamage() + playerCorruption * 1.5;
          self.hurt(damageToTakeAmount);
        }
        let damageTakenText = add([
          text(`${Math.round(damageToTakeAmount)}`, { size: 16 }),
          animate(),
          pos(self.worldPos().x, self.worldPos().y - 30),
          opacity(1),
          color(0, 200, 200),
          lifespan(0.2, { fade: 0.2 }),
          z(3000),
        ]);
        damageTakenText.animate(
          "pos",
          [
            vec2(damageTakenText.pos),
            vec2(damageTakenText.pos.x, damageTakenText.pos.y - 30),
          ],
          { duration: 0.2, loops: 1 }
        );

        shake(2);

        hpBar.width = (self.hp() * 50) / initialHealth;

        if (self.hp() <= 0) {
          self.enterState("destroy");
          return;
        }

        self.use(color(255, 0, 0));
        wait(0.05, () => {
          self.use(color(255, 255, 255));
        });
      }

      function die() {
        player.corruption += 1;
        player.enterState("corrupted");

        const willDropItem = rand(100);
        let index = randi(0, 3);

        const itemToDrop = ["crystal", "life-orb", "energy-orb"][index];

        // Maybe start with larger drop % and then reduce it as game gets more
        // Difficult
        if (willDropItem > 40) {
          if (itemToDrop === "crystal") {
            initCrystal({
              x: self.pos.x,
              y: self.pos.y,
              healAmount: 3,
            });
          }

          if (itemToDrop === "life-orb") {
            initLifeOrb({
              x: self.pos.x,
              y: self.pos.y,
              amount: 3,
            });
          }

          if (itemToDrop === "energy-orb") {
            initEnergyOrb({
              x: self.pos.x + 20,
              y: self.pos.y,
              amount: 5,
            });
          }
        }

        player.expPoints += self.expPoints;
        gameState.currentMobs--;
        gameState.totalMobsKilled++;

        destroy(self);
      }

      function removeOutOfBounds() {
        console.log("remove out of bounds");
        gameState.currentMobs--;
        destroy(self);
      }
    },

    // destroy(this: EnemyAIContext) {
    //   const self = this;
    //   const willDropHeart = rand(100);
    //   if (willDropHeart > 50) {
    //     initHeart({
    //       x: this.pos.x,
    //       y: this.pos.y,
    //       healAmount: 3,
    //     });
    //   }

    //   player.expPoints += self.expPoints;
    //   gameState.currentMobs--;
    //   gameState.totalMobsKilled++;
    // },
  };
}
