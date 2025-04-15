import {
  SpriteComp,
  PosComp,
  AreaComp,
  BodyComp,
  AnchorComp,
  HealthComp,
  GameObj,
  StateComp,
} from "kaplay";

const HP = 30;
const SPEED = 300;
const BULLET_SPEED = 800;
const INITAL_ENERGY = 20;
const INITAL_MAX_ENERGY = 20;
const INITAL_MAX_STAMINA = 20;
const INITAL_MAX_HP = 30;
const INITAL_STAMINA = 20;
const INITIAL_CORRUPTION = 0;
const MAX_CORRUPTION = 50;
const CORRUPTION_DECAY_DELAY = 3; // in seconds
const CORRUPTION_INCREMENT = 3;
const STAT_WIDTH = 300;
const HEALTH_STATUS_WIDTH = STAT_WIDTH;
const ENERGY_STATUS_WIDTH = STAT_WIDTH;
const STAMINA_STATUS_WIDTH = STAT_WIDTH;
const CORRUPTION_STATUS_WIDTH = STAT_WIDTH;

type Skill = {
  name: string;
  damage: number;
  manaCost?: number;
  staminaCost?: number;
  unlockLevel?: number;
  isSlected?: boolean;
  isUnlocked?: boolean;
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
      maxMana: number;
      maxStamina: number;
      mana: number;
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
    health(HP),
    z(3000),
    "player",
    {
      canTakeDamage: true,
      level: 1,
      expPoints: 0,
      nextLevelExpPoints: 20,
      baseMeeleDamage: 5,
      baseRangedDamage: 10,
      cooldownReductionPercentage: 0.3,
      maxMana: INITAL_ENERGY,
      maxStamina: INITAL_STAMINA,
      mana: INITAL_ENERGY,
      stamina: INITAL_STAMINA,
      corruption: INITIAL_CORRUPTION, // current corruption points
      maxCorruption: MAX_CORRUPTION, // maximum allowed corruption
      corruptionTimer: 0, // countdown timer (in seconds)
      isDecaying: false, // flag to indicate we are in decay mode

      meeleSkills: [
        {
          name: "Slash",
          isUnlocked: true,
          manaCost: 0,
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
      ],
      rangedSKills: [
        {
          name: "Fireball",
          damage: 1,
          isUnlocked: true,
          manaCost: 1,
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
      ],
    },
  ]);

  player.selectedRangedSkill = player.rangedSKills[0];
  player.selectedMeleeSkill = player.meeleSkills[0];

  player.setMaxHP(30);

  let gun = player.add([
    sprite("gun", { width: 32, height: 8 }),
    "player-gun",
    rotate(0),
    anchor(vec2(-1, 0)),
  ]);

  let playerStats = add([
    sprite("player-stats", { anim: "idle" }),
    pos(40, 40),
    anchor("topleft"),
    fixed(),
    z(1000),
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

  let corruptionBar = playerStats.add([
    rect(CORRUPTION_STATUS_WIDTH, 15),
    pos(90, 80),
    outline(2.5),
    color(231, 65, 237),
    anchor("left"),
    "energy-bar",
  ]);

  onMouseMove(() => {
    gun.angle = toWorld(mousePos()).sub(player.pos).angle();
    gun.flipY = Math.abs(gun.angle) > 90;
  });

  const aimCircle = add([
    pos(toWorld(mousePos())),
    circle(4),
    color(255, 0, 0),
    z(1000),
    "cursor",
  ]);

  aimCircle.onUpdate(() => {
    aimCircle.pos = toWorld(mousePos());
  });

  registerInputHandlers();

  // Take damage on collision with enemies
  handlePlayerCollisions();

  // Level up system
  handleLevelUp();

  // Regen stamina
  staminaRegenLoop();

  displayPlayerStats();

  registerPlayerDeathHandler();

  // Register input handlers & movement
  registerPlayerFlipOnXAxis();
  registerMovementControls();
  registerAnimationsOnKeyPressed();
  // Helper function to increase corruption and reset decay timer
  function handleCorruptionGain() {
    player.corruption += randi(1, CORRUPTION_INCREMENT);
    player.corruptionTimer = CORRUPTION_DECAY_DELAY;
    player.isDecaying = false;
  }

  // When the player enters "corrupted", we apply the corruption logic
  player.onStateEnter("corrupted", () => {
    handleCorruptionGain();
    debug.log("Player is now CORRUPTED! (corruption =", player.corruption, ")");
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
        debug.log("Player is now CLEAN (normal).");
      }
    }
  });

  // Corruption bar: temp
  onUpdate(() => {
    // const percent = player.corruption / player.maxCorruption;
    // corruptionBar.width = percent * 50;
    corruptionBar.width =
      (player.corruption * CORRUPTION_STATUS_WIDTH) / player.maxCorruption;
  });

  // HP bar temp
  onUpdate(() => {
    healthBar.width = (player.hp() * HEALTH_STATUS_WIDTH) / player.maxHP();
    heathBarText.text = `Health \t ${player.hp()}/${player.maxHP()}`;
  });

  // Energy bar temp
  onUpdate(() => {
    energyBar.width = (player.mana * ENERGY_STATUS_WIDTH) / player.maxMana;
  });

  // Stamina bar temp
  onUpdate(() => {
    staminaBar.width =
      (player.stamina * STAMINA_STATUS_WIDTH) / player.maxStamina;
    staminaText.text = `Stamina \t ${player.stamina}/${player.maxStamina}`;
  });

  // Max corruption effect
  onUpdate(() => {
    // Check if player is corrupted
    if (player.corruption >= player.maxCorruption) {
      // 💥 Trigger max corruption effect
      handleMaxCorruption();
    }
  });

  function handleMaxCorruption() {
    // Reset corruption state
    player.corruption = 0;
    player.corruptionTimer = 0;
    player.isDecaying = false;
    player.enterState("normal"); // if you’re using state system, clear the current one

    // Reduce HP by half (rounded down)
    player.setHP(player.hp() / 2);

    // Optional: Show a visual cue / flash / sound
    debug.log("MAX CORRUPTION REACHED ⚠️ — HP HALVED!");
    add([
      text("CORRUPTION OVERLOAD!", { size: 16 }),
      pos(player.worldPos().x, player.worldPos().y - 40),
      opacity(1),
      color(255, 0, 0),
      lifespan(1, { fade: 0.5 }),
      z(999),
    ]);
  }

  return player;
};

function displayPlayerStats() {
  // display all player stats
  let textStats = `
  HP: ${player.hp()}/${player.maxHP()} \n
  Mana: ${player.mana}/${player.maxMana} \n
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
  Mana: ${player.mana}/${player.maxMana} \n
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
    console.log(`${player.stamina} / ${player.maxStamina}`);
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
      player.maxMana += 5;
      player.maxStamina += 5;
      player.mana = player.maxMana;
      player.stamina = player.maxStamina;

      player.setMaxHP(player.maxHP() + 10);
      player.setHP(player.maxHP());

      player.expPoints = 0;
      player.nextLevelExpPoints *= 1.5;

      debug.log("LEVEL UP!");
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

      if (obj.target.is("enemy")) {
        takeDamage({ damage: obj.target.touchDamage });
        return; // stop after first valid collision
      }

      if (obj.target.is("bullet")) {
        takeDamage({ damage: obj.target.bulletDamage });
        return;
      }
    }
  });
}

function registerInputHandlers() {
  onMouseDown("left", () => {
    if (!player.exists()) return;

    if (player.selectedRangedSkill.isUnlocked) {
      if (player.mana < player.selectedRangedSkill.manaCost) {
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

    if (player.selectedMeleeSkill.isUnlocked) {
      if (player.mana < player.selectedMeleeSkill.manaCost) {
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

  player.mana -= player.selectedRangedSkill.manaCost;
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

  player.mana -= player.selectedMeleeSkill.manaCost;
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
