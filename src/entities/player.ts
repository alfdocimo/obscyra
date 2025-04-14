import {
  SpriteComp,
  PosComp,
  AreaComp,
  BodyComp,
  AnchorComp,
  HealthComp,
  GameObj,
} from "kaplay";

const HP = 30;
const SPEED = 300;
const BULLET_SPEED = 800;
const INITAL_MANA = 20;
const INITAL_STAMINA = 20;

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
    health(HP),
    z(3000),
    "player",
    {
      canTakeDamage: true,
      level: 1,
      expPoints: 0,
      nextLevelExpPoints: 1,
      baseMeeleDamage: 5,
      baseRangedDamage: 10,
      cooldownReductionPercentage: 0.3,
      maxMana: INITAL_MANA,
      maxStamina: INITAL_STAMINA,
      mana: INITAL_MANA,
      stamina: INITAL_STAMINA,

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

  player.add([
    rect(50, 5),
    pos(-25, -25),
    outline(1),
    color(255, 0, 100),
    anchor("left"),
    "health-bar",
  ]);

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
    add([text("lol you suck!?"), pos(center())]);
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
    if (player.stamina < player.maxStamina) {
      player.stamina += 2;
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
      player.get("health-bar")[0].width = (player.hp() * 50) / player.maxHP();

      player.expPoints = 0;
      player.nextLevelExpPoints += 10;

      player.add([
        text("Level Up!"),
        anchor("center"),
        pos(0, -50),
        opacity(1),
        lifespan(1, {
          fade: 0.5,
        }),
        z(1000),
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
  player.get("health-bar")[0].width = (player.hp() * 50) / player.maxHP();

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
