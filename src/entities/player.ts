import {
  SpriteComp,
  PosComp,
  AreaComp,
  BodyComp,
  AnchorComp,
  HealthComp,
  GameObj,
  StateComp,
  ColorComp,
} from "kaplay";
import { GAME } from "../config";
import { addFadingNumber, addFadingText } from "../utils/add-fading-text";
import {
  spawnGunParticles,
  spawnParticlesAtGameObj,
  spawnParticlesAtPlayerDeathPosition,
  spawnParticlesAtPosition,
  spawnParticlesFromCenter,
} from "../utils/spawn-particles";
import { gameState } from "../game-state";

const INITIAL_HP = 30;
const SPEED = 300;
const BULLET_SPEED = 800;
const INITAL_ENERGY = 40;
const INITAL_MAX_ENERGY = INITAL_ENERGY;
const INITAL_STAMINA = 30;
const INITAL_MAX_STAMINA = INITAL_STAMINA;

const INITIAL_CORRUPTION = 0;
const MAX_CORRUPTION = 50;
const CORRUPTION_DECAY_DELAY = 8; // in seconds
const CORRUPTION_INCREMENT = 1;
const STAT_WIDTH = 308;
const SKILL_STAT_WIDTH = 142;

const HEALTH_STATUS_WIDTH = STAT_WIDTH;
const ENERGY_STATUS_WIDTH = SKILL_STAT_WIDTH;
const STAMINA_STATUS_WIDTH = SKILL_STAT_WIDTH;
const CORRUPTION_STATUS_WIDTH = STAT_WIDTH;
const EXPERIENCE_STATUS_WIDTH = 138;

const SELECTED_SKILL_COLOR = [200, 200, 240];
const UNSELECTED_SKILL_COLOR = [255, 255, 255];

export const HP_COLOR = [146, 0, 10];
export const ENERGY_COLOR = [34, 175, 228];
const STAMINA_COLOR = [125, 180, 87];
export const CORRUPTION_COLOR = [255, 38, 162];
const EXPERIENCE_COLOR = [235, 157, 15];
export const LIGHT_RED = [255, 111, 111];

type Skill = {
  name: string;
  damage: number;
  energyCost?: number;
  staminaCost?: number;
  unlockLevel?: number;
  invoke: () => void;
  isCoolingDown?: boolean;
  cooldownTime?: number;
  soundName?: string;
};

type RangedSkill = Skill & {
  type: "ranged";
};

type MeleeSkill = Skill & {
  type: "melee";
};

let player: GameObj<
  | SpriteComp
  | PosComp
  | AreaComp
  | BodyComp
  | AnchorComp
  | HealthComp
  | StateComp
  | {
      canTakeDamage: boolean;
      baseMeeleDamage: number;
      baseRangedDamage: number;
      cooldownReductionPercentage: number;
      nextLevelExpPoints: number;
      expPoints: number;
      level: number;
      maxEnergy: number;
      maxStamina: number;
      energy: number;
      stamina: number;
      corruption: number;
      maxCorruption: number;
      corruptionTimer: number;
      isDecaying: boolean;
      canRegenStamina: boolean;
      rangedSKills: RangedSkill[];
      meeleSkills: MeleeSkill[];
      selectedRangedSkill?: RangedSkill; // This ensures only "ranged" skills can be assigned here
      selectedMeleeSkill?: MeleeSkill; // This ensures only "melee" skills can be assigned here
    }
>;

const initPlayer = () => {
  player = add([
    sprite("player", {
      width: 32,
      height: 32,
      anim: "idle",
    }),
    pos(center()),
    area({ shape: new Rect(vec2(0, 0), 16, 32) }),
    body(),
    anchor("center"),
    state("normal", ["normal", "corrupted"]),
    health(INITIAL_HP),
    z(3000),
    "player",
    {
      canTakeDamage: true,
      canRegenStamina: true,
      level: 1,
      expPoints: 0,
      nextLevelExpPoints: 20,
      baseMeeleDamage: 5,
      baseRangedDamage: 10,
      cooldownReductionPercentage: 0.3,
      maxEnergy: INITAL_MAX_ENERGY,
      maxStamina: INITAL_MAX_STAMINA,
      energy: INITAL_ENERGY,
      stamina: INITAL_STAMINA,
      corruption: INITIAL_CORRUPTION, // current corruption points
      maxCorruption: MAX_CORRUPTION, // maximum allowed corruption
      corruptionTimer: 0, // countdown timer (in seconds)
      isDecaying: false, // flag to indicate we are in decay mode

      meeleSkills: [
        {
          name: "skill-sword-slash",
          energyCost: 0,
          staminaCost: 3,
          unlockLevel: 1,
          type: "melee",
          damage: 5,
          cooldownTime: 1,
          isCoolingDown: false,
          soundName: "sword-swoosh",
          invoke: () => {
            // const SLASH_LENGTH = 60;
            // const SLASH_WIDTH = 10;

            let angle = toWorld(mousePos()).sub(player.worldPos()).angle();
            let dir = toWorld(mousePos()).sub(player.worldPos()).unit();

            let duration = 0.5;

            player.add([
              pos(dir.scale(10)),
              sprite("blade", { anim: "attack", animSpeed: 2.7 }),
              anchor(vec2(-1, 0)),
              rotate(angle),
              area(),
              opacity(1),
              animate(),
              lifespan(duration, { fade: 0.2 }),
              z(2000),
              "player-slash",
            ]);

            // slash.animate("angle", [angle - 130, angle + 130], {
            //   duration: duration,
            //   loops: 1,
            // });

            // let slash = player.add([
            //   sprite("testsword", { width: 64, height: 64, anim: "attack" }),
            // ]);
          },
        },
        {
          name: "skill-long-slash",
          energyCost: 0,
          staminaCost: 7,
          unlockLevel: 5,
          type: "melee",
          damage: 10,
          cooldownTime: 1,
          isCoolingDown: false,
          soundName: "long-slash",
          invoke: () => {
            // const SLASH_LENGTH = 60;
            // const SLASH_WIDTH = 10;

            let angle = toWorld(mousePos()).sub(player.worldPos()).angle();
            let dir = toWorld(mousePos()).sub(player.worldPos()).unit();

            let duration = 0.5;

            player.add([
              pos(dir.scale(10)),
              sprite("blade", { anim: "attack", animSpeed: 2.7 }),
              anchor(vec2(-1, 0)),
              rotate(angle),
              area(),
              opacity(1),
              animate(),
              lifespan(duration, { fade: 0.2 }),
              z(2000),
              "player-slash",
            ]);

            let blandOffset = dir.scale(16); // 16px forward (half of 32px gun width)

            let bulletStartPos = player.worldPos().add(blandOffset);
            // Create bullet
            let playerLongSlash = add([
              // rect(4, 4), // bullet shape (12x12)
              sprite("long-slash", {
                anim: "play",
              }),
              pos(bulletStartPos), // spawn it at the player's position
              move(dir, BULLET_SPEED * 1.5), // move in the direction of the mouse with BULLET_SPEED
              area(),
              opacity(1),
              lifespan(0.05, {
                fade: 0.25,
              }),
              anchor(vec2(-1, 0)),
              rotate(angle),
              offscreen({ destroy: true }),
              color(212, 30, 255), // blue bullet color
              "player-long-slash", // tag for bullet (useful for collision detection)
            ]);

            playerLongSlash.onCollide("wall", () => {
              playerLongSlash.destroy();
            });
          },
        },
        {
          name: "skill-circle-slash",
          energyCost: 0,
          staminaCost: 12,
          unlockLevel: 15,
          type: "melee",
          damage: 15,
          cooldownTime: 1.5,
          isCoolingDown: false,
          soundName: "circle-slash",
          invoke: () => {
            // const SLASH_LENGTH = 60;
            // const SLASH_WIDTH = 10;

            let angle = toWorld(mousePos()).sub(player.worldPos()).angle();
            let dir = toWorld(mousePos()).sub(player.worldPos()).unit();

            let duration = 0.5;

            player.add([
              pos(dir),
              sprite("circle-slash", { anim: "attack", animSpeed: 2.7 }),
              anchor(vec2(0, 0)),
              rotate(angle),
              area(),
              opacity(1),
              animate(),
              lifespan(duration, { fade: 0.2 }),
              z(2000),
              "player-circle-slash",
            ]);

            // slash.animate("angle", [angle - 130, angle + 130], {
            //   duration: duration,
            //   loops: 1,
            // });

            // let slash = player.add([
            //   sprite("testsword", { width: 64, height: 64, anim: "attack" }),
            // ]);
          },
        },
        {
          name: "skill-protect",
          energyCost: 0,
          staminaCost: 0,
          unlockLevel: 20,
          type: "melee",
          damage: 5,
          cooldownTime: 5,
          isCoolingDown: false,
          soundName: "protect",
          invoke: () => {
            // const SLASH_LENGTH = 60;
            // const SLASH_WIDTH = 10;

            function displayAddHpFromProtectText(hpToAdd: number) {
              addFadingText({
                gameObj: player,
                txt: `+${Math.round(hpToAdd)}`,
                txtColor: HP_COLOR,
              });
            }

            // let duration = player.stamina;
            player.canRegenStamina = false;

            let protect = player.add([
              pos(0, 0),
              sprite("protect", { anim: "play" }),
              // anchor(vec2(-1, 0)),
              anchor("center"),
              // rotate(angle),
              area(),
              opacity(0.5),
              animate(),
              z(9000),
              "player-protect",
              {
                canHeal: true,
                update() {
                  player.canTakeDamage = false;
                  player.stamina -= dt() * 8;
                  if (player.stamina <= 0) {
                    destroy(this);
                  }
                },
                destroy() {
                  player.canTakeDamage = true;
                  player.canRegenStamina = true;
                },
              },
            ]);

            protect.onCollide("enemy", (enemy) => {
              play("protect-damage", { loop: false, volume: 0.3 });
              if (protect.canHeal) {
                let healAmount = enemy.touchDamage / 2;
                player.heal(healAmount);
                displayAddHpFromProtectText(healAmount);
                protect.canHeal = false;
                wait(1, () => {
                  protect.canHeal = true;
                });
              }
            });
            protect.onCollide("bullet", (bullet) => {
              play("protect-damage", { loop: false, volume: 0.3 });

              destroy(bullet);
              if (protect.canHeal) {
                let healAmount = bullet.bulletDamage / 2;
                player.heal(healAmount);
                displayAddHpFromProtectText(healAmount);
                protect.canHeal = false;
                wait(1, () => {
                  protect.canHeal = true;
                });
              }
            });

            protect.onCollide("hard-enemy-osc", (osc) => {
              destroy(osc);
              if (protect.canHeal) {
                let healAmount = osc.bulletDamage / 2;
                player.heal(healAmount);
                displayAddHpFromProtectText(healAmount);
                protect.canHeal = false;
                wait(1, () => {
                  protect.canHeal = true;
                });
              }
            });

            protect.onCollide("hard-enemy-laser-beam", (laserBeam) => {
              if (protect.canHeal) {
                let healAmount = laserBeam.bulletDamage / 2;
                player.heal(healAmount);
                displayAddHpFromProtectText(healAmount);
                protect.canHeal = false;
                wait(1, () => {
                  protect.canHeal = true;
                });
              }
            });
          },
        },
      ],
      rangedSKills: [
        {
          name: "skill-single-shot",
          damage: 4,
          energyCost: 1,
          staminaCost: 0,
          unlockLevel: 1,
          type: "ranged",
          cooldownTime: 0.3,
          isCoolingDown: false,
          soundName: "shoot",
          invoke: () => {
            let dir = toWorld(mousePos()).sub(player.worldPos()).unit();
            let gunOffset = dir.scale(16); // 16px forward (half of 32px gun width)

            let bulletStartPos = player.worldPos().add(gunOffset);

            let playerBullet = add([
              // rect(4, 4), // bullet shape (12x12)
              sprite("player-bullet-basic", {
                width: 6,
                height: 6,
              }),
              pos(bulletStartPos), // spawn it at the player's position
              move(dir, BULLET_SPEED * 1.5), // move in the direction of the mouse with BULLET_SPEED
              area(),
              anchor("center"),
              offscreen({ destroy: true }),
              color(212, 30, 255), // blue bullet color
              "player-bullet", // tag for bullet (useful for collision detection)
            ]);

            let muzzleFlashOffset = dir.scale(32); // tweak this number to go further from the gun
            let muzzleFlashPos = player.worldPos().add(muzzleFlashOffset);

            let part = spawnGunParticles({
              posVec2: muzzleFlashPos,
              colors: [Color.fromArray(EXPERIENCE_COLOR), Color.WHITE],
            });
            // Create bullet
            part.emit(6);

            playerBullet.onCollide("wall", () => {
              playerBullet.destroy();
            });
          },
        },
        {
          name: "skill-tri-shot",
          damage: 12,
          energyCost: 5,
          staminaCost: 0,
          unlockLevel: 5,
          type: "ranged",
          cooldownTime: 0.3,
          isCoolingDown: false,
          soundName: "tri-shot",
          invoke: () => {
            const ANGLE_OFFSET = 10; // degrees
            const BULLET_SPEED_MULTIPLIER = 1.5;

            function degToRad(deg) {
              return (deg * Math.PI) / 180;
            }

            const baseDir = toWorld(mousePos()).sub(player.worldPos()).unit();
            const baseAngle = Math.atan2(baseDir.y, baseDir.x); // angle in radians

            // List of angles: center, above, below
            const angles = [
              baseAngle, // straight
              baseAngle - degToRad(ANGLE_OFFSET), // slightly up
              baseAngle + degToRad(ANGLE_OFFSET), // slightly down
            ];

            for (let angle of angles) {
              // Rotate vector manually
              const rotatedDir = vec2(Math.cos(angle), Math.sin(angle));
              const bulletStartPos = player
                .worldPos()
                .add(rotatedDir.scale(16));

              const bullet = add([
                sprite("player-bullet-basic", {
                  width: 6,
                  height: 6,
                }),
                pos(bulletStartPos),
                move(rotatedDir, BULLET_SPEED * BULLET_SPEED_MULTIPLIER),
                area(),
                anchor("center"),
                offscreen({ destroy: true }),
                color(212, 30, 255),
                "player-bullet",
              ]);

              bullet.onCollide("wall", () => bullet.destroy());
            }
          },
        },
        {
          name: "skill-moving-shot",
          damage: 12,
          energyCost: 7,
          staminaCost: 0,
          unlockLevel: 15,
          type: "ranged",
          cooldownTime: 0.8,
          isCoolingDown: false,
          soundName: "moving-shot",
          invoke: () => {
            const dir = toWorld(mousePos()).sub(player.worldPos()).unit();
            const speed = BULLET_SPEED / 2;

            const startPos = player.worldPos().add(dir.scale(16));

            const sineBullet = add([
              sprite("moving-shot", {
                width: 6,
                height: 6,
              }),
              pos(startPos),
              opacity(1),
              lifespan(1, { fade: 0.25 }),
              area(),
              anchor("center"),
              offscreen({ destroy: true }),
              "player-moving-bullet",
              {
                dir,
                time: 0,
                amplitude: 5, // start small
                frequency: 30, // higher = tighter wave
                maxAmplitude: 600,
                speed,
                originalPos: startPos.clone(),
                update() {
                  this.time += dt();

                  // Increase amplitude over time, clamp it
                  this.amplitude = Math.min(
                    this.amplitude + dt() * 100,
                    this.maxAmplitude
                  );

                  // Move forward
                  const forward = this.dir.scale(this.speed * dt());
                  this.originalPos = this.originalPos.add(forward);

                  // Get a perpendicular vector for sine motion
                  const perp = vec2(-this.dir.y, this.dir.x);

                  // Offset with sine wave
                  const waveOffset = perp.scale(
                    Math.sin(this.time * this.frequency) * this.amplitude
                  );

                  // Set final position
                  this.pos = this.originalPos.add(waveOffset);

                  this.width = this.width + dt() * 50;
                  this.height = this.height + dt() * 50;
                },
              },
            ]);

            sineBullet.onCollide("wall", () => {
              sineBullet.destroy();
            });
          },
        },
        {
          name: "skill-final-shot",
          damage: 25,
          energyCost: 0,
          staminaCost: 0,
          unlockLevel: 20,
          type: "ranged",
          cooldownTime: 5,
          isCoolingDown: false,
          soundName: "final-shot",
          invoke: () => {
            let dir = toWorld(mousePos()).sub(player.worldPos()).unit();
            let gunOffset = dir.scale(16); // 16px forward (half of 32px gun width)

            let angle = toWorld(mousePos()).sub(player.worldPos()).angle();

            let bulletStartPos = player.worldPos().add(gunOffset);
            // Create bullet
            let playerBullet = add([
              // pos(dir.scale(1)),
              anchor(vec2(-1, 0)),
              rotate(angle),
              sprite("final-shot", {
                anim: "play",
                animSpeed: 1.5,
              }),
              pos(bulletStartPos), // spawn it at the player's position
              // move(dir, BULLET_SPEED * 1.5), // move in the direction of the mouse with BULLET_SPEED
              area(),
              // anchor("center"),
              opacity(1),
              lifespan(1, { fade: 0.25 }),
              z(9000),
              // offscreen({ destroy: true }),
              // color(212, 30, 255), // blue bullet color
              "player-final-shot-bullet", // tag for bullet (useful for collision detection)
              {
                update() {
                  this.angle = toWorld(mousePos())
                    .sub(player.worldPos())
                    .angle();
                  this.pos = player.worldPos().add(gunOffset);
                },
              },
            ]);
          },
        },
      ],
    },
  ]);
  player.setMaxHP(INITIAL_HP);

  // debug.inspect = true;

  setDefaultPlayerSkills();

  let gun = initPlayerGun();

  let {
    corruptionBar,
    corruptionText,
    healthBar,
    heathBarText,
    energyBar,
    energyText,
    staminaBar,
    staminaText,
    playerStats,
    playerSkillsStats,
    playerStatsUIAnim,
    // experienceBar,
    // experienceBarText,
    experienceBar,
    totalExperienceStatsText,
    levelStatsText,
  } = initPlayerStatsUI();

  updateCorruptionColorInPlayerStats(playerStatsUIAnim);

  /// --- SKILLS

  let skillSingleShot = playerSkillsStats.add([
    sprite("skill-single-shot"),
    "skill-single-shot",
    anchor("topleft"),
    opacity(1),
    color(Color.fromArray(SELECTED_SKILL_COLOR)),
    pos(6, 6),
    fixed(),
    z(10000),
  ]);
  addSkillKeyboardKey(skillSingleShot, "1");

  let skillTriShot = playerSkillsStats.add([
    sprite("skill-tri-shot"),
    "skill-tri-shot",
    anchor("topleft"),
    color(Color.fromArray(UNSELECTED_SKILL_COLOR)),
    opacity(0),
    pos(42, 6),
    fixed(),
    z(10000),
  ]);
  addSkillKeyboardKey(skillTriShot, "2");

  let skillMovingShot = playerSkillsStats.add([
    sprite("skill-moving-shot"),
    "skill-moving-shot",
    anchor("topleft"),
    color(Color.fromArray(UNSELECTED_SKILL_COLOR)),
    opacity(0),
    pos(78, 6),
    fixed(),
    z(10000),
  ]);
  addSkillKeyboardKey(skillMovingShot, "3");

  let skillFinalShot = playerSkillsStats.add([
    sprite("skill-final-shot"),
    "skill-final-shot",
    anchor("topleft"),
    color(Color.fromArray(UNSELECTED_SKILL_COLOR)),
    opacity(0),
    pos(114, 6),
    fixed(),
    z(10000),
  ]);
  addSkillKeyboardKey(skillFinalShot, "4");

  const rangedSkillsSlotsGameObjects = [
    skillSingleShot,
    skillTriShot,
    skillMovingShot,
    skillFinalShot,
  ];

  let skillSwordSlash = playerSkillsStats.add([
    sprite("skill-sword-slash"),
    "skill-sword-slash",
    opacity(1),
    anchor("topleft"),
    color(Color.fromArray(SELECTED_SKILL_COLOR)),
    pos(6, 42),
    fixed(),
    z(10000),
  ]);
  addSkillKeyboardKey(skillSwordSlash, "Z");

  let skillLongSlash = playerSkillsStats.add([
    sprite("skill-long-slash"),
    "skill-long-slash",
    opacity(0),
    anchor("topleft"),
    color(Color.fromArray(UNSELECTED_SKILL_COLOR)),
    pos(42, 42),
    fixed(),
    z(10000),
  ]);

  addSkillKeyboardKey(skillLongSlash, "X");

  let skillCircleSlash = playerSkillsStats.add([
    sprite("skill-circle-slash"),
    "skill-circle-slash",
    opacity(0),
    anchor("topleft"),
    color(Color.fromArray(UNSELECTED_SKILL_COLOR)),
    pos(78, 42),
    fixed(),
    z(10000),
  ]);

  addSkillKeyboardKey(skillCircleSlash, "C");

  let skillProtect = playerSkillsStats.add([
    sprite("skill-protect"),
    "skill-protect",
    opacity(0),
    anchor("topleft"),
    color(Color.fromArray(UNSELECTED_SKILL_COLOR)),
    pos(114, 42),
    fixed(),
    z(10000),
  ]);

  addSkillKeyboardKey(skillProtect, "V");

  const meeleSkillsSlotsGameObjects = [
    skillSwordSlash,
    skillLongSlash,
    skillCircleSlash,
    skillProtect,
  ];

  // Assign skill based on level logic
  const rangedSkillKeyboardInputs = ["1", "2", "3", "4"];
  rangedSkillKeyboardInputs.forEach((key, index) => {
    onKeyDown(key, () => {
      if (!player.exists()) return;
      let skillKey = index;

      if (player.level >= player.rangedSKills[skillKey].unlockLevel) {
        rangedSkillsSlotsGameObjects.forEach((skillSlot) => {
          skillSlot.color = Color.fromArray(UNSELECTED_SKILL_COLOR);
        });

        rangedSkillsSlotsGameObjects[skillKey].color =
          Color.fromArray(SELECTED_SKILL_COLOR);
        player.selectedRangedSkill = player.rangedSKills[skillKey];
      }
    });
  });

  const meeleeSkillKeyboardInputs = ["z", "x", "c", "v"];
  meeleeSkillKeyboardInputs.forEach((key, index) => {
    onKeyDown(key, () => {
      if (!player.exists()) return;
      let skillKey = index;

      if (player.level >= player.meeleSkills[skillKey].unlockLevel) {
        meeleSkillsSlotsGameObjects.forEach((skillSlot) => {
          skillSlot.color = Color.fromArray(UNSELECTED_SKILL_COLOR);
        });

        meeleSkillsSlotsGameObjects[skillKey].color =
          Color.fromArray(SELECTED_SKILL_COLOR);
        player.selectedMeleeSkill = player.meeleSkills[skillKey];
      }
    });
  });

  onUpdate(() => {
    if (player.level >= 5) {
      skillTriShot.opacity = 1;
      skillLongSlash.opacity = 1;
    }

    if (player.level >= 15) {
      skillMovingShot.opacity = 1;
      skillCircleSlash.opacity = 1;
    }

    if (player.level >= 20) {
      skillFinalShot.opacity = 1;
      skillProtect.opacity = 1;
    }
  });

  initializeAimIndicator();

  registerInputHandlers();

  // Take damage on collision with enemies
  handlePlayerCollisions();

  // Level up system
  handleLevelUp();

  // Regen stamina
  staminaRegenLoop();

  // displayPlayerStats();

  registerPlayerDeathHandler();

  // Register input handlers & movement
  registerPlayerFlipOnXAxis();
  registerMovementControls();
  registerAnimationsOnKeyPressed();

  // When the player enters "corrupted", we apply the corruption logic
  player.onStateEnter("corrupted", () => {
    handleCorruptionGain();
  });

  // While in "corrupted", manage the timer and decay
  player.onStateUpdate("corrupted", () => {
    if (player.corruptionTimer >= 0) {
      player.corruptionTimer -= dt();
    } else {
      player.isDecaying = true;
    }

    if (player.isDecaying && player.corruption >= 0) {
      player.corruption = Math.max(player.corruption - dt() * 2, 0);
      if (player.corruption <= 0) {
        player.corruption = 0;
        player.corruptionTimer = 0;
        player.isDecaying = false;
        player.enterState("normal");
      }
    }
  });

  // Update player stats in UI
  updatePlayerStatsInUI({
    corruptionBar,
    corruptionText,
    healthBar,
    heathBarText,
    energyBar,
    energyText,
    staminaBar,
    staminaText,
    experienceBar,
    levelStatsText,
    totalExperienceStatsText,
  });

  checkCorrutionAmountInPlayer();

  return player;
};

function updateCorruptionColorInPlayerStats(
  playerStatsUIAnim: GameObj<SpriteComp | PosComp | AnchorComp | ColorComp>
) {
  onUpdate(() => {
    const t = player.corruption / player.maxCorruption;
    // 255, 38, 162 <- Should be this color instead! Now is purple all the way
    const r = 255; // stays constant
    const g = 255 - (255 - 38) * t;
    const b = 255 - (255 - 162) * t;

    playerStatsUIAnim.color = Color.fromArray([r, g, b]);
  });
}

function updatePlayerStatsInUI({
  corruptionBar,
  corruptionText,
  healthBar,
  heathBarText,
  energyBar,
  energyText,
  staminaBar,
  staminaText,
  levelStatsText,
  experienceBar,
  totalExperienceStatsText,
}) {
  // EXP BAR
  onUpdate(() => {
    levelStatsText.text = `Level:  ${player.level}`;
    experienceBar.width =
      (player.expPoints * EXPERIENCE_STATUS_WIDTH) / player.nextLevelExpPoints;

    totalExperienceStatsText.text = `Exp \t ${Math.round(
      player.expPoints
    )}/${Math.round(player.nextLevelExpPoints)}`;
  });

  // CORRUPTION BAR 🟣
  onUpdate(() => {
    // const percent = player.corruption / player.maxCorruption;
    // corruptionBar.width = percent * 50;
    corruptionBar.width =
      (player.corruption * CORRUPTION_STATUS_WIDTH) / player.maxCorruption;

    corruptionText.text = `Corrup \t\t ${Math.round(player.corruption)}/${
      player.maxCorruption
    }`;
  });

  // HP BAR 🟥
  onUpdate(() => {
    healthBar.width = (player.hp() * HEALTH_STATUS_WIDTH) / player.maxHP();
    heathBarText.text = `Health \t\t ${
      player.hp() >= 0 ? player.hp() : 0
    }/${player.maxHP()}`;
  });

  // ENERGY BAR 🟦
  onUpdate(() => {
    energyBar.width = (player.energy * ENERGY_STATUS_WIDTH) / player.maxEnergy;
    energyText.text = `Energy \t ${player.energy}/${player.maxEnergy}`;
  });

  // STAMINA BAR 🟩
  onUpdate(() => {
    staminaBar.width =
      (player.stamina * STAMINA_STATUS_WIDTH) / player.maxStamina;
    staminaText.text = `Stamina \t ${Math.round(player.stamina)}/${
      player.maxStamina
    }`;
  });
}

function handleMaxCorruption() {
  // Reset corruption state
  player.corruption = 0;
  player.corruptionTimer = 0;
  player.isDecaying = false;
  player.enterState("normal"); // if you’re using state system, clear the current one

  play("max-corruption", { loop: false, volume: 0.3 });
  play("max-corruption-explotion", { loop: false, volume: 0.2 });
  takeCorruptionDamage({ damage: Math.round(player.maxHP() / 1.25) });

  let parts = spawnParticlesFromCenter({
    x: player.pos.x,
    y: player.pos.y,
    colors: [
      Color.fromArray(CORRUPTION_COLOR),
      Color.BLACK,
      Color.fromArray(HP_COLOR),
    ],
  });
  parts.emit(10);
}

function checkCorrutionAmountInPlayer() {
  // Max corruption effect
  onUpdate(() => {
    // Check if player is corrupted
    if (player.corruption >= player.maxCorruption) {
      // 💥 Trigger max corruption effect
      handleMaxCorruption();
    }
  });
}

function initializeAimIndicator() {
  let aimCircle = add([
    pos(toWorld(mousePos())),
    anchor("center"),
    sprite("aim-circle"),
    z(10000),
    "cursor",
  ]);

  aimCircle.onUpdate(() => {
    aimCircle.pos = toWorld(mousePos());
  });

  return aimCircle;
}

function initPlayerGun() {
  let gun = player.add([
    sprite("gun", { width: 32, height: 8 }),
    "player-gun",
    rotate(0),
    anchor(vec2(-1, 0)),
  ]);

  onMouseMove(() => {
    gun.angle = toWorld(mousePos()).sub(player.pos).angle();
    gun.flipY = Math.abs(gun.angle) > 90;
  });

  return gun;
}

function initPlayerStatsUI() {
  let playerSkillsStats = add([
    sprite("player-skills-ui"),
    anchor("topleft"),
    pos(GAME.CANVAS_WIDTH / 2 + 90, GAME.CANVAS_HEIGHT - 90),
    fixed(),
    z(10000),
  ]);

  let levelStats = add([
    sprite("level-stats-ui"),
    anchor("topleft"),
    pos(10, GAME.CANVAS_HEIGHT - 50),
    fixed(),
    z(10000),
  ]);

  let experienceBar = levelStats.add([
    rect(EXPERIENCE_STATUS_WIDTH, 16),
    pos(6, 24),
    color(Color.fromArray(EXPERIENCE_COLOR)),
    anchor("left"),
    "experience-bar",
  ]);

  let levelStatsText = levelStats.add([
    text("", { size: 8 }),
    pos(6, 10),
    color(Color.BLACK),
    anchor("left"),
    z(1000),
  ]);

  let totalExperienceStatsText = levelStats.add([
    text("", { size: 8 }),
    pos(12, 25),
    color(Color.BLACK),
    anchor("left"),
    z(1000),
  ]);

  let playerStats = add([
    sprite("player-stats"),
    pos(8, 8),
    anchor("topleft"),
    fixed(),
    z(10000),
  ]);

  let playerStatsUIAnim = playerStats.add([
    sprite("player-stats-ui-anim", { anim: "play" }),
    pos(1, 2),
    scale(1),
    color(255, 255, 255),
    anchor("topleft"),
    "player-stats-ui-anim",
  ]);

  let healthBar = playerStats.add([
    rect(HEALTH_STATUS_WIDTH, 32),
    pos(80, 25),
    color(Color.fromArray(HP_COLOR)),
    anchor("left"),
    "health-bar",
  ]);

  let heathBarText = healthBar.add([
    text("", { size: 10 }),
    pos(10, 1),
    color(Color.WHITE),
    anchor("left"),
    z(1000),
  ]);

  let staminaBar = playerSkillsStats.add([
    rect(STAMINA_STATUS_WIDTH, 32),
    pos(150, 22),

    color(Color.fromArray(STAMINA_COLOR)),
    anchor("left"),
    "stamina-bar",
  ]);

  let staminaText = staminaBar.add([
    text("", { size: 10 }),
    pos(10, 0),
    color(Color.WHITE),
    anchor("left"),
    z(1000),
  ]);

  let energyBar = playerSkillsStats.add([
    rect(ENERGY_STATUS_WIDTH, 32),
    pos(150, 58),
    color(Color.fromArray(ENERGY_COLOR)),
    anchor("left"),
    "energy-bar",
  ]);

  let energyText = energyBar.add([
    text("", { size: 10 }),
    pos(10, 0),
    color(Color.WHITE),
    anchor("left"),
    z(1000),
  ]);

  let corruptionBar = playerStats.add([
    rect(CORRUPTION_STATUS_WIDTH, 32),
    pos(80, 62),
    color(Color.fromArray(CORRUPTION_COLOR)),
    anchor("left"),
    "energy-bar",
  ]);

  let corruptionText = corruptionBar.add([
    text("", { size: 10 }),
    pos(10, 1),
    color(Color.WHITE),
    anchor("left"),
    z(1000),
  ]);

  // let experienceBar = playerStats.add([
  //   rect(EXPERIENCE_STATUS_WIDTH, 11),
  //   pos(80, 82),
  //   color(Color.fromArray(EXPERIENCE_COLOR)),
  //   anchor("left"),
  //   "energy-bar",
  // ]);

  // let experienceBarText = experienceBar.add([
  //   text("", { size: 10 }),
  //   pos(10, 0),
  //   color(255, 255, 255),
  //   anchor("left"),
  //   z(1000),
  // ]);

  return {
    // experienceBar,
    // experienceBarText,
    totalExperienceStatsText,
    levelStatsText,
    experienceBar,
    playerStats,
    corruptionBar,
    corruptionText,
    healthBar,
    heathBarText,
    energyBar,
    energyText,
    staminaBar,
    staminaText,
    playerSkillsStats,
    playerStatsUIAnim,
  };
}

function setDefaultPlayerSkills() {
  player.selectedRangedSkill = player.rangedSKills[0];
  player.selectedMeleeSkill = player.meeleSkills[0];
}

// Helper function to increase corruption and reset decay timer
function handleCorruptionGain() {
  player.corruption += randi(1, CORRUPTION_INCREMENT);
  player.corruptionTimer = CORRUPTION_DECAY_DELAY;
  player.isDecaying = false;
}

function registerPlayerDeathHandler() {
  player.on("death", () => {
    let playerPos = {
      x: player.pos.x,
      y: player.pos.y,
    };
    destroy(player);
    play("death", { loop: false, volume: 0.3 });
    let parts = spawnParticlesAtPlayerDeathPosition({
      x: playerPos.x,
      y: playerPos.y,
    });
    parts.emit(30);

    wait(2, () => {
      add([
        rect(width(), height()),
        pos(toWorld(center())),
        anchor("center"),
        color(Color.BLACK),
        opacity(1),
        fadeIn(2),

        z(10000),
      ]);

      wait(2, () => {
        add([
          text("You died..."),
          z(11000),
          pos(toWorld(center())),
          anchor("center"),
        ]);
        add([
          text(`Max wave reached: ${gameState.currentWave}`, { size: 20 }),
          z(11000),
          pos(toWorld(center()).add(0, 60)),
          anchor("center"),
        ]);

        add([
          text(`Going back to menu...`, { size: 20 }),
          z(11000),
          pos(toWorld(center()).add(0, 120)),
          anchor("center"),
        ]);
      });

      wait(10, () => {
        go("menu");
      });
    });
  });
}

function registerMovementControls() {
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
}

function staminaRegenLoop() {
  loop(0.5, () => {
    if (player.exists() && player.canRegenStamina) {
      if (player.stamina < player.maxStamina) {
        if (player.stamina + 2 >= player.maxStamina) {
          player.stamina = player.maxStamina;
        } else {
          player.stamina += 2;
        }
      }
    }
  });
}

function handleLevelUp() {
  onUpdate(() => {
    if (!player.exists()) return;

    if (player.expPoints >= player.nextLevelExpPoints) {
      play("level-up", { loop: false, volume: 0.3 });

      player.level += 1;

      // Apply dynamic level-up effects
      player.baseMeeleDamage += getMeeleDamageIncrease(player.level);
      player.baseRangedDamage += getRangedDamageIncrease(player.level);
      player.cooldownReductionPercentage = getCooldownReduction(player.level);

      const maxEnergyGain = getResourceIncrease(player.level);
      const maxStaminaGain = getResourceIncrease(player.level);
      player.maxEnergy += maxEnergyGain;
      player.maxStamina += maxStaminaGain;
      player.energy = player.maxEnergy;
      player.stamina = player.maxStamina;

      const hpBoost = getMaxHPIncrease(player.level);
      player.setMaxHP(player.maxHP() + hpBoost);
      player.setHP(player.maxHP());

      player.expPoints = 0;
      player.nextLevelExpPoints = getNextLevelExp(player.level);

      addFadingText({
        gameObj: player,
        txt: "Level up!",
        txtColor: EXPERIENCE_COLOR,
        fadeDuration: 2,
        size: 18,
      });

      player.use(color(Color.fromArray(EXPERIENCE_COLOR)));

      wait(2, () => {
        player.use(color(255, 255, 255)); // Revert to white or original color
      });
    }
  });
}

function handlePlayerCollisions() {
  player.onUpdate(() => {
    const touching = player.getCollisions();

    for (const obj of touching) {
      if (!player.canTakeDamage) return;

      if (obj.target.is("enemy")) {
        takeDamage({ damage: obj.target.touchDamage });
        return; // stop after first valid collision
      }

      if (obj.target.is("bullet")) {
        takeDamage({ damage: obj.target.bulletDamage });
        return;
      }

      if (obj.target.is("hard-enemy-osc")) {
        takeDamage({ damage: obj.target.bulletDamage });
        return;
      }

      if (obj.target.is("hard-enemy-laser-beam")) {
        takeDamage({ damage: obj.target.bulletDamage });
        return;
      }
    }
  });
}

function registerInputHandlers() {
  onMouseDown("left", () => {
    if (!player.exists()) return;

    if (player.selectedRangedSkill.unlockLevel <= player.level) {
      if (player.energy < player.selectedRangedSkill.energyCost) {
        return;
      }
      if (player.stamina < player.selectedRangedSkill.staminaCost) {
        return;
      }
      castSelectedRangedSkill();
    }
  });

  onMouseDown("right", () => {
    if (!player.exists()) return;

    if (player.selectedMeleeSkill.unlockLevel <= player.level) {
      if (player.energy < player.selectedMeleeSkill.energyCost) {
        return;
      }
      if (player.stamina < player.selectedMeleeSkill.staminaCost) {
        return;
      }
      castSelectedMeeleSkill();
    }
  });
}

function takeDamage({ damage }: { damage: number }) {
  if (!player.canTakeDamage) return;

  player.canTakeDamage = false;

  player.play("hurt");
  play("hurt", {
    loop: false,
  });
  shake(5);

  player.hurt(damage);

  addFadingText({
    gameObj: player,
    txt: `-${Math.round(damage)}`,
    txtColor: HP_COLOR,
  });

  const parts = spawnParticlesAtGameObj({
    gameObj: player,
    colors: [Color.fromArray(HP_COLOR), Color.BLACK],
  });
  parts.emit(4);

  player.use(color(255, 0, 0));

  // Wait for 0.5 seconds, then revert to original color
  wait(1, () => {
    player.use(color(255, 255, 255)); // Revert to white or original color
    player.canTakeDamage = true;
  });
}

function takeCorruptionDamage({ damage }: { damage: number }) {
  player.play("hurt");
  shake(10);

  player.hurt(damage);

  addFadingText({
    gameObj: player,
    txt: `-${Math.round(damage)}`,
    txtColor: HP_COLOR,
  });

  player.use(color(255, 0, 255));

  // Wait for 0.5 seconds, then revert to original color
  wait(1, () => {
    player.use(color(255, 255, 255)); // Revert to white or original color
  });
}

function castSelectedRangedSkill() {
  let selectedSkill = player.selectedRangedSkill;
  if (selectedSkill.isCoolingDown) {
    return;
  }
  selectedSkill?.invoke();
  play(selectedSkill.soundName, {
    loop: false,
    volume: 0.3,
  });

  selectedSkill.isCoolingDown = true;

  player.energy -= player.selectedRangedSkill.energyCost;
  player.stamina -= player.selectedRangedSkill.staminaCost;

  //Special case:
  if (selectedSkill.name === "skill-final-shot") {
    player.energy -= player.energy / 2;
  }

  wait(selectedSkill.cooldownTime, () => {
    selectedSkill.isCoolingDown = false;
  });
}

function castSelectedMeeleSkill() {
  let selectedSkill = player.selectedMeleeSkill;
  if (selectedSkill.isCoolingDown) {
    return;
  }
  selectedSkill?.invoke();
  play(selectedSkill.soundName, {
    loop: false,
    volume: 0.3,
  });

  selectedSkill.isCoolingDown = true;

  player.energy -= player.selectedMeleeSkill.energyCost;
  player.stamina -= player.selectedMeleeSkill.staminaCost;
  wait(selectedSkill.cooldownTime, () => {
    selectedSkill.isCoolingDown = false;
  });
}

function registerAnimationsOnKeyPressed() {
  ["a", "w", "s", "d"].forEach((key) => {
    onKeyPress(key, () => {
      player.play("walk");
    });
    onKeyRelease(key, () => {
      if (
        !isKeyDown("a") &&
        !isKeyDown("w") &&
        !isKeyDown("s") &&
        !isKeyDown("d")
      ) {
        player.play("idle");
      }
    });
  });
}

export function getSelectedRangedSkillDamage() {
  return player.selectedRangedSkill.damage + player.baseRangedDamage;
}

export function getSelectedMeleeSkillDamage() {
  return player.selectedMeleeSkill.damage + player.baseMeeleDamage;
}

function registerPlayerFlipOnXAxis() {
  player.onUpdate(() => {
    player.flipX = toWorld(mousePos()).x < player.pos.x;
  });
}

function addSkillKeyboardKey(gameObj: GameObj, key: string) {
  gameObj
    .add([rect(12, 12), color(Color.WHITE)])
    .add([text(key, { size: 10 }), pos(2, 2), color(Color.BLACK)]);
}

function getNextLevelExp(currentLevel: number): number {
  const baseExp = 20;
  const growthRate = 1.3;
  return Math.floor(baseExp * Math.pow(growthRate, currentLevel - 1));
}

function getMeeleDamageIncrease(currentLevel: number): number {
  return Math.min(2 + Math.floor(currentLevel / 3), 10); // capped at +10
}

function getRangedDamageIncrease(currentLevel: number): number {
  return Math.min(1 + Math.floor(currentLevel / 5), 6); // capped at +6
}

function getCooldownReduction(currentLevel: number): number {
  return Math.min(0.1 + currentLevel * 0.01, 0.3); // capped at 30%
}

function getMaxHPIncrease(currentLevel: number): number {
  return 10 + Math.floor(currentLevel * 1.5);
}

function getResourceIncrease(currentLevel: number): number {
  return 5 + Math.floor(currentLevel * 0.5);
}

export { initPlayer, player };
