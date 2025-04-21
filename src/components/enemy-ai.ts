import {
  GameObj,
  PosComp,
  StateComp,
  HealthComp,
  AreaComp,
  AnchorComp,
} from "kaplay";
import {
  CORRUPTION_COLOR,
  getSelectedMeleeSkillDamage,
  getSelectedRangedSkillDamage,
  HP_COLOR,
  player,
} from "../entities/player";
import { initCrystal } from "../entities/crystal";
import { gameState } from "../game-state";
import { initLifeOrb } from "../entities/life-orb";
import { initEnergyOrb } from "../entities/energy-orb";
import { addFadingNumber } from "../utils/add-fading-text";
import {
  spawnParticlesFromCenter,
  spawnParticlesAtGameObj,
  spawnParticlesAtPosition,
} from "../utils/spawn-particles";

export const LASER_COLOR = [255, 68, 142];
export const ENEMY_ACTION_COLOR = [255, 211, 15];
export const ENEMY_ACTION_COLOR_ACCENT = [255, 158, 15];

type EnemyAIConfig = {
  bulletColor?: number[];
  attackDuration?: number;
  moveDuration?: number;
  idleDuration?: number;
  bulletSpeed?: number;
  bulletSize?: number;
  isBoss?: boolean;
  isRunningEnemy?: boolean;
  speed?: number;
  shootSound: string;
  hurtSound: string;
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
    hurtSound: "perinola-shoot",
    shootSound: "hurt-perinola",
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
        // outline(0.5, Color.fromArray([221, 78, 37])),
        color(Color.fromArray([146, 0, 10])),
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
        let randomIdleDuration = rand(3);
        await wait(randomIdleDuration);
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
            await flashAndPerformAction({
              maxFlashes: 8,
              flashInterval: 0.2,
              self,
              action: () => {
                if (!self.exists()) return;

                const dir = p.pos.sub(self.pos).unit();

                let enemyBullet = add([
                  pos(self.pos),
                  move(dir, bulletSpeed),
                  rect(bulletSize, bulletSize),
                  color(Color.BLACK),
                  area(),
                  offscreen({ destroy: true }),
                  anchor("center"),
                  "bullet",
                  {
                    bulletDamage: self.bulletDamage,
                    update() {
                      let part = spawnParticlesFromCenter({
                        x: this.pos.x,
                        y: this.pos.y,
                      });
                      part.emit(5);
                    },
                  },
                ]);

                enemyBullet.onCollide("player", () => {
                  destroy(enemyBullet);
                });

                enemyBullet.onCollide("wall", () => {
                  destroy(enemyBullet);
                });
              },

              fromColor: [255, 255, 255],
              toColor: LASER_COLOR,
            });
          } else {
            await flashAndPerformAction({
              maxFlashes: 8,
              flashInterval: 0.2,
              self,
              action: () => {
                if (!self.exists()) return;
                const dir = p.pos.sub(self.pos).unit();

                let enemyBullet = add([
                  pos(self.pos),
                  move(dir, bulletSpeed),
                  rect(bulletSize, bulletSize),
                  area(),
                  offscreen({ destroy: true }),
                  anchor("center"),
                  color(Color.fromArray(ENEMY_ACTION_COLOR_ACCENT)),
                  "bullet",
                  { bulletDamage: self.bulletDamage },
                ]);

                play(config.shootSound, { loop: false });

                enemyBullet.onCollide("player", () => {
                  destroy(enemyBullet);
                });

                enemyBullet.onCollide("wall", () => {
                  destroy(enemyBullet);
                });
              },
              fromColor: [255, 255, 255],
              toColor: ENEMY_ACTION_COLOR,
            });
          }
        }

        let randomAttackDuration = rand(3);
        await wait(randomAttackDuration);
        self.enterState("move");
      });

      self.onStateEnter("laser-beam-attack", async () => {
        const p = player;
        if (p.exists() && self.exists()) {
          await flashAndPerformAction({
            maxFlashes: 20,
            flashInterval: 0.125,
            self,
            action: () => {
              if (!self.exists()) return;

              const dir = player.worldPos().sub(self.worldPos()).unit();
              const gunOffset = dir.scale(80); // move it forward from the enemy
              const angle = player.worldPos().sub(self.worldPos()).angle();
              const bulletStartPos = self.worldPos().add(gunOffset);

              play("boss-laser", { loop: false });

              const beam = add([
                rect(700, 8),
                pos(bulletStartPos),
                anchor(vec2(-1, 0)), // pivot from the left side, just like in your example
                rotate(angle),
                area(),
                color(Color.fromArray(LASER_COLOR)),
                opacity(1),
                lifespan(0.3, { fade: 0.1 }),
                z(9000),
                "hard-enemy-laser-beam",
                { bulletDamage: this.bulletDamage * 2 },
              ]);
            },

            fromColor: [255, 255, 255],
            toColor: LASER_COLOR,
          });
        }

        let randomAttackDuration = rand(3);
        await wait(randomAttackDuration);
        self.enterState("move");
      });

      self.onStateEnter("move", async () => {
        let randomMoveDuration = rand(3);
        await wait(randomMoveDuration);
        self.enterState("idle");
      });

      self.onStateUpdate("move", () => {
        const p = player;
        if (!p?.exists()) return;
        const dir = p.pos.sub(self.pos).unit();
        self.move(dir.scale(speed));
      });

      self.onStateEnter("destroy", async () => {
        // Flash is causing an issue with mobs spawning
        let currentPos = {
          x: self.pos.x,
          y: self.pos.y,
        };
        die();

        let parts = spawnParticlesFromCenter({
          x: currentPos.x,
          y: currentPos.y,
          colors: [
            Color.WHITE,
            Color.fromArray(ENEMY_ACTION_COLOR),
            Color.fromArray(ENEMY_ACTION_COLOR_ACCENT),
          ],
        });
        parts.emit(10);
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
        const corruptionBonus = getCorruptionBonusDamage(player.corruption);
        let damageToTakeAmount = 1;

        if (skillType === "ranged") {
          damageToTakeAmount = getSelectedRangedSkillDamage() + corruptionBonus;
        }

        if (skillType === "melee") {
          damageToTakeAmount = getSelectedMeleeSkillDamage() + corruptionBonus;
        }

        self.hurt(damageToTakeAmount);
        play(config.hurtSound, { loop: false });

        addFadingNumber({
          gameObj: self,
          number: damageToTakeAmount,
          txtColor: [255, 255, 255],
          size:
            16 +
            (Math.min(player.corruption, player.maxCorruption) /
              player.maxCorruption) *
              10,
        });

        // const parts = self.add([
        //   particles(
        //     {
        //       max: 30,
        //       speed: [300, 400], // 🔥 faster burst
        //       angle: [120, 360], // or narrow it like [250, 290] for cone
        //       angularVelocity: [300, 360], // 🎯 more spin = more energy
        //       lifeTime: [0.3, 0.6], // ⏱️ fast fade
        //       colors: [Color.fromArray(CORRUPTION_COLOR), Color.WHITE],
        //       opacities: [1.0, 0.6, 0.0], // 🚀 punch then fade
        //       scales: [1.2, 1.8, 0.5], // 💥 pop then shrink
        //       texture: getSprite("purple-particle").data.tex,
        //       quads: [getSprite("purple-particle").data.frames[0]],
        //     },
        //     {
        //       lifetime: 0.6,
        //       rate: 0, // still manual burst
        //       direction: rand(250, 290), // 💨 tighter directional burst
        //       spread: 80, // still a bit wild
        //     }
        //   ),
        // ]);
        const parts = spawnParticlesAtGameObj({
          gameObj: self,
          colors: [Color.fromArray(CORRUPTION_COLOR), Color.WHITE],
        });
        parts.emit(3);
        // let damageTakenText = add([
        //   text(`${Math.round(damageToTakeAmount)}`, { size: 16 }),
        //   animate(),
        //   pos(self.worldPos().x, self.worldPos().y - 30),
        //   opacity(1),
        //   color(0, 200, 200),
        //   lifespan(0.2, { fade: 0.2 }),
        //   z(3000),
        // ]);

        // damageTakenText.animate(
        //   "pos",
        //   [
        //     vec2(damageTakenText.pos),
        //     vec2(damageTakenText.pos.x, damageTakenText.pos.y - 30),
        //   ],
        //   { duration: 0.2, loops: 1 }
        // );

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

        const baseDropChance = 40;
        const wave = gameState.currentWave || 1;
        const dropChance = baseDropChance - wave * 0.5;

        if (rand(100) > Math.max(dropChance, 10)) {
          const chances = getDropChancesByWave(wave);
          const itemToDrop = pickWeightedItem(chances);

          if (itemToDrop === "crystal") {
            initCrystal({ x: self.pos.x, y: self.pos.y });
          } else if (itemToDrop === "life-orb") {
            initLifeOrb({
              x: self.pos.x,
              y: self.pos.y,
              amount: getOrbRecoveryAmount(3),
            });
          } else if (itemToDrop === "energy-orb") {
            initEnergyOrb({
              x: self.pos.x + 20,
              y: self.pos.y,
              amount: getOrbRecoveryAmount(5),
            });
          }
        }

        player.expPoints += self.expPoints;
        gameState.currentMobs -= 1;
        gameState.totalMobsKilled++;

        console.log("Mob destroyed. Current:", gameState.currentMobs);
        destroy(self);
      }

      function removeOutOfBounds() {
        gameState.currentMobs -= 1;
        console.log("Mob destroyed. Current:", gameState.currentMobs);
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

  async function flashAndPerformAction({
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
    fromColor: number[];
    toColor: number[];
    action: () => void;
  }) {
    for (let i = 0; i < maxFlashes; i++) {
      self.use(
        color(
          i % 2 === 0 ? Color.fromArray(fromColor) : Color.fromArray(toColor)
        )
      );
      await wait(flashInterval);
    }

    self.use(color(rgb(255, 255, 255))); // Reset color
    action(); // Only perform action once flash is done
  }
}

function getCorruptionBonusDamage(corruption: number): number {
  const scalingFactor = 1.5; // tweak this to make corruption more/less impactful
  return Math.log2(corruption + 1) * scalingFactor;
}

function getOrbRecoveryAmount(baseValue: number): number {
  const scalingFactor = 1.2; // tune this to make it feel right
  return Math.round(
    baseValue + Math.log2(gameState.currentWave + 1) * scalingFactor
  );
}

function getCorruptionDamageColor(): number[] {
  const t = player.corruption / player.maxCorruption;

  const white = [255, 255, 255];
  const vibrantPurple = ENEMY_ACTION_COLOR;

  const r = Math.floor(white[0] + (vibrantPurple[0] - white[0]) * t);
  const g = Math.floor(white[1] + (vibrantPurple[1] - white[1]) * t);
  const b = Math.floor(white[2] + (vibrantPurple[2] - white[2]) * t);

  return [r, g, b];
}

function getDropChancesByWave(wave) {
  const progress = Math.min(wave / 30, 1);

  return {
    crystal: lerp(0.2, 0.6, progress),
    lifeOrb: lerp(0.2, 0.5, progress),
    energyOrb: lerp(0.5, 0.2, progress),
  };
}

function pickWeightedItem(weights) {
  const total = weights.crystal + weights.lifeOrb + weights.energyOrb;
  const roll = rand(total);

  if (roll < weights.crystal) return "crystal";
  if (roll < weights.crystal + weights.lifeOrb) return "life-orb";
  return "energy-orb";
}
