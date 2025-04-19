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
  isBoss?: boolean;
  isRunningEnemy?: boolean;
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

export function enemyAI(
  config: EnemyAIConfig = {
    isBoss: false,
    isRunningEnemy: false,
  }
) {
  let initialHealth = undefined;

  return {
    id: "enemyAI",

    require: ["pos", "state", "health", "area", "anchor"],

    add(this: EnemyAIContext) {
      const self = this;

      initialHealth = self.hp();

      let hpYPosition = config.isBoss ? -70 : -45;
      // Create health bar
      const hpBar = self.add([
        rect(50, 5),
        pos(-25, hpYPosition),
        outline(0.5, Color.fromArray([221, 78, 37])),
        color(221, 78, 37),
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
        if (config.isBoss) {
          let shoudFireLaserBeam = randi(100);
          if (shoudFireLaserBeam < 20) {
            self.enterState("laser-beam-attack");
          } else {
            self.enterState("attack");
          }
        } else {
          self.enterState("attack");
        }
      });

      self.onStateEnter("attack", async () => {
        const p = player;
        if (p.exists() && self.exists()) {
          if (config.isBoss) {
            flashAndPerformAction({
              maxFlashes: 8,
              flashInterval: 0.2,
              self,
              action: () => {
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
              },

              fromColor: [255, 255, 255],
              toColor: [245, 221, 24],
            });
          } else {
            flashAndPerformAction({
              maxFlashes: 8,
              flashInterval: 0.2,
              self,
              action: () => {
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
              },
              fromColor: [255, 255, 255],
              toColor: [245, 221, 24],
            });
          }
        }

        await wait(attackDuration);
        self.enterState("move");
      });

      self.onStateEnter("laser-beam-attack", async () => {
        const p = player;
        if (p.exists() && self.exists()) {
          flashAndPerformAction({
            maxFlashes: 16,
            flashInterval: 0.125,
            self,
            action: () => {
              const dir = player.worldPos().sub(self.worldPos()).unit();
              const gunOffset = dir.scale(80); // move it forward from the enemy
              const angle = player.worldPos().sub(self.worldPos()).angle();
              const bulletStartPos = self.worldPos().add(gunOffset);

              const beam = add([
                rect(800, 10),
                pos(bulletStartPos),
                anchor(vec2(-1, 0)), // pivot from the left side, just like in your example
                rotate(angle),
                area(),
                opacity(1),
                lifespan(0.3, { fade: 0.1 }),
                z(9000),
                "enemy-final-shot",
              ]);
            },

            fromColor: [255, 255, 255],
            toColor: [255, 38, 162],
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
        flashAndPerformAction({
          maxFlashes: 4,
          self,
          action: () => die(),
          fromColor: [255, 255, 255],
          toColor: [255, 0, 0],
        });
      });

      self.onCollide("player-bullet", (playerBullet) => {
        destroy(playerBullet);
        takeDamageFromSkill("ranged");
      });

      self.onCollide("player-moving-bullet", (playerBullet) => {
        takeDamageFromSkill("ranged");
      });

      self.onCollide("player-final-shot-bullet", (playerBullet) => {
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

  function flashAndPerformAction({
    self,
    flashInterval = 0.1,
    maxFlashes = 4,
    fromColor,
    toColor,
    action,
  }: {
    self: EnemyAIContext;
    flashInterval?: number;
    maxFlashes?: number;
    fromColor: [number, number, number];
    toColor: [number, number, number];
    action: () => void;
  }) {
    let flashCount = 0;

    const flashTimer = loop(flashInterval, () => {
      self.use(
        color(
          flashCount % 2 === 0
            ? Color.fromArray(fromColor)
            : Color.fromArray(toColor)
        )
      );

      flashCount++;

      if (flashCount >= maxFlashes) {
        flashTimer.cancel();
        self.use(color(rgb(255, 255, 255)));
        action();
      }
    });
  }
}
