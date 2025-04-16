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

const INITIAL_HP = 30;
const SPEED = 300;
const BULLET_SPEED = 800;
const INITAL_ENERGY = 20;
const INITAL_MAX_ENERGY = 20;
const INITAL_MAX_STAMINA = 20;

const INITAL_STAMINA = 20;
const INITIAL_CORRUPTION = 0;
const MAX_CORRUPTION = 50;
const CORRUPTION_DECAY_DELAY = 3; // in seconds
const CORRUPTION_INCREMENT = 1;
const STAT_WIDTH = 300;
const HEALTH_STATUS_WIDTH = STAT_WIDTH;
const ENERGY_STATUS_WIDTH = STAT_WIDTH;
const STAMINA_STATUS_WIDTH = STAT_WIDTH;
const CORRUPTION_STATUS_WIDTH = STAT_WIDTH;

const SELECTED_SKILL_COLOR = [200, 255, 240];
const UNSELECTED_SKILL_COLOR = [255, 255, 255];

type Skill = {
  name: string;
  damage: number;
  energyCost?: number;
  staminaCost?: number;
  unlockLevel?: number;
  invoke: () => void;
  isCoolingDown?: boolean;
  cooldownTime?: number;
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
      level: 1,
      expPoints: 0,
      nextLevelExpPoints: 2,
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
          staminaCost: 5,
          unlockLevel: 1,
          type: "melee",
          damage: 5,
          cooldownTime: 1,
          isCoolingDown: false,
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
          staminaCost: 10,
          unlockLevel: 2,
          type: "melee",
          damage: 10,
          cooldownTime: 1,
          isCoolingDown: false,
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
      ],
      rangedSKills: [
        {
          name: "skill-single-shot",
          damage: 1,
          energyCost: 1,
          staminaCost: 3,
          unlockLevel: 1,
          type: "ranged",
          cooldownTime: 0.5,
          isCoolingDown: false,
          invoke: () => {
            let dir = toWorld(mousePos()).sub(player.worldPos()).unit();
            let gunOffset = dir.scale(16); // 16px forward (half of 32px gun width)

            let bulletStartPos = player.worldPos().add(gunOffset);
            // Create bullet
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

            playerBullet.onCollide("wall", () => {
              playerBullet.destroy();
            });
          },
        },
        {
          name: "skill-tri-shot",
          damage: 5,
          energyCost: 5,
          staminaCost: 3,
          unlockLevel: 2,
          type: "ranged",
          cooldownTime: 0.5,
          isCoolingDown: false,
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
          damage: 1,
          energyCost: 1,
          staminaCost: 3,
          unlockLevel: 2,
          type: "ranged",
          cooldownTime: 0.5,
          isCoolingDown: false,
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
  } = initPlayerStatsUI();

  /// --- SKILLS

  let skillSingleShot = playerStats.add([
    sprite("skill-single-shot"),
    "skill-single-shot",
    anchor("topleft"),
    color(Color.fromArray(SELECTED_SKILL_COLOR)),
    pos(85, 100),
    fixed(),
    z(10000),
  ]);

  let skillTriShot = playerStats.add([
    sprite("skill-tri-shot"),
    "skill-tri-shot",
    anchor("topleft"),
    color(Color.fromArray(UNSELECTED_SKILL_COLOR)),
    opacity(0),
    pos(122, 100),
    fixed(),
    z(10000),
  ]);

  let skillMovingSHot = playerStats.add([
    sprite("skill-moving-shot"),
    "skill-moving-shot",
    anchor("topleft"),
    color(Color.fromArray(UNSELECTED_SKILL_COLOR)),
    opacity(0),
    pos(160, 100),
    fixed(),
    z(10000),
  ]);

  const rangedSkillsSlotsGameObjects = [
    skillSingleShot,
    skillTriShot,
    skillMovingSHot,
  ];

  let skillSwordSlash = playerStats.add([
    sprite("skill-sword-slash"),
    "skill-sword-slash",
    outline(0.2),
    anchor("topleft"),
    color(Color.fromArray(SELECTED_SKILL_COLOR)),
    pos(85, 135),
    fixed(),
    z(10000),
  ]);

  let skillLongSlash = playerStats.add([
    sprite("skill-long-slash"),
    "skill-long-slash",
    opacity(0),
    anchor("topleft"),
    color(Color.fromArray(UNSELECTED_SKILL_COLOR)),
    pos(122, 135),
    fixed(),
    z(10000),
  ]);

  const meeleSkillsSlotsGameObjects = [skillSwordSlash, skillLongSlash];

  // Assign skill based on level logic
  const rangedSkillKeyboardInputs = ["1", "2", "3"];
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

  const meeleeSkillKeyboardInputs = ["z", "x"];
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
    if (player.level >= 2) {
      skillTriShot.opacity = 1;
      skillLongSlash.opacity = 1;
      skillMovingSHot.opacity = 1;
    }
  });

  /// ----

  const aimCircle = initializeAimIndicator();

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
      player.corruption = Math.max(player.corruption - dt() * 8, 0);
      if (player.corruption <= 0) {
        player.corruption = 0;
        player.corruptionTimer = 0;
        player.isDecaying = false;
        player.enterState("normal");
      }
    }
  });

  // Update player stats in UI
  updatePlayerStatsInUI(
    corruptionBar,
    corruptionText,
    healthBar,
    heathBarText,
    energyBar,
    energyText,
    staminaBar,
    staminaText
  );

  checkCorrutionAmountInPlayer();

  return player;
};

function updatePlayerStatsInUI(
  corruptionBar,
  corruptionText,
  healthBar,
  heathBarText,
  energyBar,
  energyText,
  staminaBar,
  staminaText
) {
  // CORRUPTION BAR 🟣
  onUpdate(() => {
    // const percent = player.corruption / player.maxCorruption;
    // corruptionBar.width = percent * 50;
    corruptionBar.width =
      (player.corruption * CORRUPTION_STATUS_WIDTH) / player.maxCorruption;

    corruptionText.text = `Corruption \t ${Math.round(player.corruption)}/${
      player.maxCorruption
    }`;
  });

  // HP BAR 🟥
  onUpdate(() => {
    healthBar.width = (player.hp() * HEALTH_STATUS_WIDTH) / player.maxHP();
    heathBarText.text = `Health \t ${
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
    staminaText.text = `Stamina \t ${player.stamina}/${player.maxStamina}`;
  });
}

function handleMaxCorruption() {
  // Reset corruption state
  player.corruption = 0;
  player.corruptionTimer = 0;
  player.isDecaying = false;
  player.enterState("normal"); // if you’re using state system, clear the current one

  takeDamage({ damage: Math.round(player.maxHP() / 1.25) });

  add([
    text("CORRUPTION OVERLOAD!", { size: 16 }),
    pos(player.worldPos().x, player.worldPos().y - 40),
    opacity(1),
    color(255, 0, 0),
    lifespan(1, { fade: 0.5 }),
    z(999),
  ]);
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
    circle(4),
    color(255, 0, 0),
    z(1000),
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
  let playerStats = add([
    sprite("player-stats", { anim: "idle" }),
    pos(8, 8),
    anchor("topleft"),
    fixed(),
    z(10000),
  ]);

  let healthBar = playerStats.add([
    rect(HEALTH_STATUS_WIDTH, 15),
    pos(90, 20),
    outline(2.5),
    color(255, 0, 100),
    anchor("left"),
    "health-bar",
  ]);

  let heathBarText = healthBar.add([
    text("", { size: 10 }),
    pos(10, 0),
    color(255, 255, 255),
    anchor("left"),
    z(1000),
  ]);

  let staminaBar = playerStats.add([
    rect(STAMINA_STATUS_WIDTH, 15),
    pos(90, 40),
    outline(2.5),
    color(0, 200, 100),
    anchor("left"),
    "stamina-bar",
  ]);

  let staminaText = staminaBar.add([
    text("", { size: 10 }),
    pos(10, 0),
    color(255, 255, 255),
    anchor("left"),
    z(1000),
  ]);

  let energyBar = playerStats.add([
    rect(ENERGY_STATUS_WIDTH, 15),
    pos(90, 60),
    outline(2.5),
    color(0, 100, 200),
    anchor("left"),
    "energy-bar",
  ]);

  let energyText = energyBar.add([
    text("", { size: 10 }),
    pos(10, 0),
    color(255, 255, 255),
    anchor("left"),
    z(1000),
  ]);

  let corruptionBar = playerStats.add([
    rect(CORRUPTION_STATUS_WIDTH, 15),
    pos(90, 80),
    outline(2.5),
    color(231, 65, 237),
    anchor("left"),
    "energy-bar",
  ]);

  let corruptionText = corruptionBar.add([
    text("", { size: 10 }),
    pos(10, 0),
    color(255, 255, 255),
    anchor("left"),
    z(1000),
  ]);
  return {
    playerStats,
    corruptionBar,
    corruptionText,
    healthBar,
    heathBarText,
    energyBar,
    energyText,
    staminaBar,
    staminaText,
  };
}

function setDefaultPlayerSkills() {
  player.selectedRangedSkill = player.rangedSKills[0];
  player.selectedMeleeSkill = player.meeleSkills[0];
}

function displayPlayerStats() {
  // display all player stats
  let textStats = `
  HP: ${player.hp()}/${player.maxHP()} \n
  Mana: ${player.energy}/${player.maxEnergy} \n
  Stamina: ${player.stamina}/${player.maxStamina} \n
  Level: ${player.level} \n
  Exp: ${player.expPoints}/${player.nextLevelExpPoints} \n
  Attack: ${player.baseMeeleDamage} \n
  Ranged Attack: ${player.baseRangedDamage} \n
  Cooldown Reduction: ${player.cooldownReductionPercentage * 100}% \n
  Melee Skill: ${player.selectedMeleeSkill?.name} \n
  Ranged Skill: ${player.selectedRangedSkill?.name} \n
  `;
  let statsDebug = add([
    text(textStats),
    scale(0.4),
    pos(10, 10),
    fixed(),
    z(1000),
  ]);
  player.onUpdate(() => {
    statsDebug.text = `
  HP: ${player.hp()}/${player.maxHP()} \n
  Mana: ${player.energy}/${player.maxEnergy} \n
  Stamina: ${player.stamina}/${player.maxStamina} \n
  Level: ${player.level} \n
  Exp: ${player.expPoints}/${player.nextLevelExpPoints} \n
  Attack: ${player.baseMeeleDamage} \n
  Ranged Attack: ${player.baseRangedDamage} \n
  Cooldown Reduction: ${player.cooldownReductionPercentage * 100}% \n
  Melee Skill: ${player.selectedMeleeSkill?.name} \n
  Ranged Skill: ${player.selectedRangedSkill?.name} \n
  `;
  });
}

// Helper function to increase corruption and reset decay timer
function handleCorruptionGain() {
  player.corruption += randi(1, CORRUPTION_INCREMENT);
  player.corruptionTimer = CORRUPTION_DECAY_DELAY;
  player.isDecaying = false;
}

function registerPlayerDeathHandler() {
  player.on("death", () => {
    destroy(player);
    add([
      text("Morido", { size: 16 }),
      pos(player.worldPos().x, player.worldPos().y - 40),
      opacity(1),
      color(255, 0, 0),
      lifespan(1, { fade: 0.5 }),
      z(999),
    ]);
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
    if (player.exists()) {
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
    if (player.expPoints >= player.nextLevelExpPoints) {
      player.level += 1;
      player.baseMeeleDamage += 2;
      player.baseRangedDamage += 1;
      player.cooldownReductionPercentage += 0.1;
      player.maxEnergy += 5;
      player.maxStamina += 5;
      player.energy = player.maxEnergy;
      player.stamina = player.maxStamina;

      player.setMaxHP(player.maxHP() + 10);
      player.setHP(player.maxHP());

      player.expPoints = 0;
      player.nextLevelExpPoints *= 1.5;

      add([
        text("LEVEL UP OVERLOAD!", { size: 16 }),
        pos(player.worldPos().x, player.worldPos().y - 40),
        opacity(1),
        color(0, 100, 100),
        lifespan(1, { fade: 0.5 }),
        z(999),
      ]);
    }
  });
}

function handlePlayerCollisions() {
  player.onUpdate(() => {
    const touching = player.getCollisions();

    for (const obj of touching) {
      if (!player.canTakeDamage) return;

      console.log("touching", obj.target);

      if (obj.target.is("enemy")) {
        console.log("touch", obj.target.touchDamage);

        takeDamage({ damage: obj.target.touchDamage });
        return; // stop after first valid collision
      }

      if (obj.target.is("bullet")) {
        console.log("dmng", obj.target.bulletDamage);
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
  shake(5);

  player.hurt(damage);

  let damageTakenText = add([
    text(`${Math.round(damage)}`, { size: 16 }),
    animate(),
    pos(player.worldPos().x, player.worldPos().y - 30),
    opacity(1),
    color(230, 100, 100),
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

  player.use(color(255, 0, 0));

  // Wait for 0.5 seconds, then revert to original color
  wait(1, () => {
    player.use(color(255, 255, 255)); // Revert to white or original color
    player.canTakeDamage = true;
  });
}

function castSelectedRangedSkill() {
  let selectedSkill = player.selectedRangedSkill;
  if (selectedSkill.isCoolingDown) return;
  selectedSkill?.invoke();

  selectedSkill.isCoolingDown = true;

  player.energy -= player.selectedRangedSkill.energyCost;
  player.stamina -= player.selectedRangedSkill.staminaCost;
  wait(selectedSkill.cooldownTime, () => {
    selectedSkill.isCoolingDown = false;
  });
}

function castSelectedMeeleSkill() {
  let selectedSkill = player.selectedMeleeSkill;
  if (selectedSkill.isCoolingDown) return;
  selectedSkill?.invoke();

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

export { initPlayer, player };
