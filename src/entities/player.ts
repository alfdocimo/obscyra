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
const SPEED = 200;
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
      canShoot: boolean;
      attackSpeed: number;
      nextLevelExpPoints: number;
      expPoints: number;
      level: number;
      attackDamage: number;
      canSlash: boolean;
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
    sprite("bean"),
    pos(center()),
    area(),
    body(),
    anchor("center"),
    health(HP),
    "player",
    {
      canTakeDamage: true,
      canShoot: true,
      level: 1,
      expPoints: 0,
      nextLevelExpPoints: 10,
      attackDamage: 1,
      attackSpeed: 10,
      canSlash: true,
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
          damage: 2,
          cooldownTime: 1,
          isCoolingDown: false,
          invoke: () => {
            const SLASH_LENGTH = 60;
            const SLASH_WIDTH = 10;

            let angle = toWorld(mousePos()).sub(player.worldPos()).angle();
            let dir = toWorld(mousePos()).sub(player.worldPos()).unit();

            let duration = 0.2;

            const slash = player.add([
              pos(dir.scale(35)),
              rect(SLASH_LENGTH, SLASH_WIDTH),
              anchor(vec2(-1, 0)),
              rotate(angle - 90),
              color(255, 0, 0),
              area(),
              opacity(1),
              animate(),
              lifespan(duration, { fade: 0.5 }),
              z(50),
              "player-slash",
            ]);

            slash.animate("angle", [angle - 130, angle + 130], {
              duration: duration,
              loops: 1,
            });
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
            const dir = toWorld(mousePos()).sub(player.pos).unit(); // vector from player to mouse, normalized to unit vector

            // Create bullet
            let playerBullet = add([
              rect(12, 12), // bullet shape (12x12)
              pos(player.pos), // spawn it at the player's position
              move(dir, BULLET_SPEED * 1.5), // move in the direction of the mouse with BULLET_SPEED
              area(),
              anchor("center"),
              offscreen({ destroy: true }),
              color(0, 255, 255), // blue bullet color
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
    rect(100, 10),
    pos(-50, -50),
    outline(4),
    color(255, 0, 100),
    anchor("left"),
    "health-bar",
  ]);

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

  function shootBullet() {
    // Get direction from player to mouse
    const dir = toWorld(mousePos()).sub(player.pos).unit(); // vector from player to mouse, normalized to unit vector

    // Create bullet
    let playerBullet = add([
      rect(12, 12), // bullet shape (12x12)
      pos(player.pos), // spawn it at the player's position
      move(dir, BULLET_SPEED * 1.5), // move in the direction of the mouse with BULLET_SPEED
      area(),
      anchor("center"),
      offscreen({ destroy: true }),
      color(0, 255, 255), // blue bullet color
      "player-bullet", // tag for bullet (useful for collision detection)
    ]);

    playerBullet.onCollide("wall", () => {
      playerBullet.destroy();
    });
  }

  // Take damage on collision with enemies
  player.onUpdate(() => {
    const touching = player.getCollisions();

    for (const obj of touching) {
      if (!player.canTakeDamage) return;

      if (obj.target.is("enemy")) {
        playerTakeDamage({ damage: obj.target.touchDamage });
        return; // stop after first valid collision
      }

      if (obj.target.is("bullet")) {
        playerTakeDamage({ damage: obj.target.bulletDamage });
        return; // stop after first valid collision
      }
    }
  });

  // Level up system
  player.onUpdate(() => {
    if (player.expPoints >= player.nextLevelExpPoints) {
      player.level += 1;
      player.attackDamage += 1;
      player.setMaxHP(player.maxHP() + 10);
      player.attackSpeed += 1;
      player.expPoints = 0;
      player.nextLevelExpPoints += 10;

      const levelUpText = add([text("Level Up!"), pos(center())]);
      wait(1, () => {
        destroy(levelUpText);
      });
    }
  });

  // Regen stamina
  loop(0.5, () => {
    if (player.stamina < player.maxStamina) {
      player.stamina += 2;
    }
  });

  let statsDebug = add([
    text(
      `Level: ${player.level}\nExp: ${player.expPoints}/${
        player.nextLevelExpPoints
      }\nHP: ${player.hp()}/${player.maxHP()}\nAttack Damage: ${
        player.attackDamage
      }
      Mana: ${player.mana}/${player.maxMana}\nStamina: ${player.stamina}/${
        player.maxStamina
      }\n`
    ),
    pos(10, 10),
    fixed(),
    z(1000),
  ]);
  player.onUpdate(() => {
    statsDebug.text = `Level: ${player.level}\nExp: ${player.expPoints}/${
      player.nextLevelExpPoints
    }\nHP: ${player.hp()}/${player.maxHP()}\nAttack Damage: ${
      player.attackDamage
    }
    Mana: ${player.mana}/${player.maxMana}\nStamina: ${player.stamina}/${
      player.maxStamina
    }\n`;
    // statsDebug.move;
  });

  player.on("death", () => {
    destroy(player);
    add([text("lol you suck!?"), pos(center())]);
  });

  // Register input handlers & movement
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

  return player;
};

function playerTakeDamage({ damage }: { damage: number }) {
  if (!player.canTakeDamage) return;

  player.canTakeDamage = false;

  shake(20);

  player.hurt(damage);
  player.get("health-bar")[0].width = (player.hp() * 100) / player.maxHP();

  player.use(color(255, 0, 0));

  // Wait for 0.5 seconds, then revert to original color
  wait(1, () => {
    player.use(color(255, 255, 255)); // Revert to white or original color
    player.canTakeDamage = true;
  });
}
function spawnMeleeSlash() {
  const SLASH_LENGTH = 60;
  const SLASH_WIDTH = 10;

  let angle = toWorld(mousePos()).sub(player.worldPos()).angle();
  let dir = toWorld(mousePos()).sub(player.worldPos()).unit();

  let duration = 0.2;

  const slash = player.add([
    pos(dir.scale(35)),
    rect(SLASH_LENGTH, SLASH_WIDTH),
    anchor(vec2(-1, 0)),
    rotate(angle - 90),
    color(255, 0, 0),
    area(),
    opacity(1),
    animate(),
    lifespan(duration, { fade: 0.5 }),
    z(50),
    "player-slash",
  ]);

  slash.animate("angle", [angle - 130, angle + 130], {
    duration: duration,
    loops: 1,
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

export { initPlayer, player };
