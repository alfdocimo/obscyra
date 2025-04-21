import kaplay from "kaplay";
import "kaplay/global";
import { CORRUPTION_COLOR, initPlayer, player } from "./entities/player";
import { initPerinolaEnemy } from "./entities/perinola";

import { initMidEnemy } from "./entities/mid-enemy";
import { GAME } from "./config";
import getMobRandomPos from "./utils/get-mob-random-pos";
import { addBackground, addWorldBounds, spawnRandomWalls } from "./level";
import { gameState } from "./game-state";
import { initFastEnemy } from "./entities/fast-enemy";
import { initHardEnemy } from "./entities/hard-enemy";

// @ts-check

// Use state() component to handle basic AI

kaplay({
  root: document.querySelector("#game-container"),
  font: "ode_to_idle_gaming",
  width: GAME.CANVAS_WIDTH,
  height: GAME.CANVAS_HEIGHT,
  scale: 1,
});

loadFont(
  "ode_to_idle_gaming",
  "/fonts/ode_to_idle_gaming/ode_to_idle_gaming.woff"
);

loadSprite("player", "/sprites/cosito32.png", {
  sliceX: 4,
  sliceY: 2,
  anims: {
    idle: {
      from: 0,
      to: 0,
      loop: false,
    },
    walk: {
      from: 0,
      to: 3,
      loop: true,
    },
    hurt: {
      from: 4,
      to: 6,
      loop: false,
    },
  },
});
loadSprite("blade", "/sprites/blade.png", {
  sliceX: 4,
  sliceY: 3,
  anims: {
    attack: {
      from: 0,
      to: 11,
      loop: false,
    },
  },
});
loadSprite("gun", "/sprites/gun.png");
loadSprite("ghosty", "/sprites/ghosty.png");
loadSprite("tri-mob", "/sprites/tri-mob.png", {
  sliceX: 4,
  sliceY: 2,
  anims: {
    float: {
      from: 0,
      to: 3,
      loop: true,
    },
  },
});
loadSprite("crystal", "/sprites/crystal.png", {
  sliceX: 3,
  sliceY: 3,
  anims: {
    idle: {
      from: 0,
      to: 6,
      loop: true,
    },
  },
});
loadSprite("mid-enemy", "/sprites/mid-enemy.png", {
  sliceX: 3,
  sliceY: 3,
  anims: {
    float: {
      from: 0,
      to: 6,
      loop: true,
    },
  },
});
loadSprite("player-bullet-basic", "/sprites/player-bullet.png");
loadSprite("tiny-ghosty", "/sprites/ghostiny.png");
loadSprite("gigagantrum", "/sprites/gigagantrum.png");
loadSprite("heart", "/sprites/heart.png", {
  sliceX: 3,
  sliceY: 3,
  anims: {
    idle: {
      from: 0,
      to: 6,
      loop: true,
    },
  },
});
loadSprite("steel", "/sprites/steel.png");
loadSprite("level", "/bg/level.png");
loadSprite("test-map", "/bg/test-map.png", {
  singular: true,
});
loadSprite("life-orb", "/sprites/life-orb-red.png", {
  sliceX: 3,
  sliceY: 3,
  anims: {
    idle: {
      from: 0,
      to: 6,
      loop: true,
    },
  },
});
loadSprite("energy-orb", "/sprites/energy-orb.png", {
  sliceX: 3,
  sliceY: 3,
  anims: {
    idle: {
      from: 0,
      to: 6,
      loop: true,
    },
  },
});

loadSprite("aim-circle", "/sprites/aim-circle.png");

loadSprite("player-stats", "/sprites/test-ui-stats-3.png");

loadSprite("player-skills-ui", "/sprites/test-player-skills-ui-2.png");
loadSprite("level-stats-ui", "/sprites/level-stats-ui.png");

loadSprite("player-stats-ui-anim", "/sprites/cosito-stats-ui.png", {
  sliceX: 5,
  sliceY: 5,
  anims: {
    play: {
      from: 0,
      to: 23,
      loop: true,
    },
  },
});

loadSprite("skill-final-shot", "/sprites/skill-final-shot.png");

loadSprite("final-shot", "/sprites/final-shot.png", {
  sliceX: 2,
  sliceY: 11,
  anims: {
    play: {
      from: 0,
      to: 21,
      loop: false,
    },
  },
});

loadSprite("protect", "/sprites/protect.png", {
  sliceX: 4,
  sliceY: 4,
  anims: {
    play: {
      from: 0,
      to: 14,
      loop: true,
    },
  },
});

loadSprite("fast-enemy", "/sprites/fast-enemy.png", {
  sliceX: 4,
  sliceY: 2,
  anims: {
    float: {
      from: 0,
      to: 7,
      loop: true,
    },
  },
});

loadSprite("hard-enemy", "/sprites/hard-enemy.png", {
  sliceX: 5,
  sliceY: 4,
  anims: {
    float: {
      from: 0,
      to: 18,
      loop: true,
    },
  },
});

loadSprite("hard-enemy-osc", "/sprites/hard-enemy-osc.png");

loadSprite("skill-single-shot", "/sprites/skill-single-shot.png");
loadSprite("skill-sword-slash", "/sprites/skill-sword-slash.png");
loadSprite("skill-tri-shot", "/sprites/skill-tri-shot.png");
loadSprite("skill-long-slash", "/sprites/skill-long-slash.png");
loadSprite("skill-moving-shot", "/sprites/skill-moving-shot.png");
loadSprite("skill-protect", "/sprites/skill-protect.png");
loadSprite("long-slash", "/sprites/long-slash.png", {
  sliceX: 3,
  sliceY: 3,
  anims: {
    play: {
      loop: true,
      from: 0,
      to: 7,
    },
  },
});
loadSprite("moving-shot", "/sprites/moving-shot.png");
loadSprite("circle-slash", "/sprites/circle-slash.png", {
  sliceX: 3,
  sliceY: 4,
  anims: {
    attack: {
      from: 0,
      to: 9,
    },
  },
});
loadSprite("skill-circle-slash", "/sprites/skill-circle-slash.png");
loadSprite("purple-particle", "/sprites/purple-particle.png");
loadSprite("intro-bg", "/bg/intro.png");
loadSprite("crystal-option", "/sprites/crystal-option-no-bg.png");

loadSound("hurt", "/sounds/hurt-test.wav");
loadSound("shoot", "/sounds/shoot.wav");
loadSound("hurt-perinola", "/sounds/hurt-perinola.wav");
loadSound("sword-swoosh", "/sounds/sword-swoosh.wav");
loadSound("perinola-shoot", "/sounds/perinola-shoot.wav");
loadSound("tri-shot", "/sounds/tri-shot.wav");
loadSound("moving-shot", "/sounds/moving-shot.wav");
loadSound("final-shot", "/sounds/final-shot.wav");
loadSound("long-slash", "/sounds/long-slash.wav");
loadSound("circle-slash", "/sounds/circle-slash.wav");
loadSound("cooling-down", "/sounds/cooling-down.wav");
loadSound("protect", "/sounds/protect.wav");
loadSound("protect-damage", "/sounds/protect-damage.wav");
loadSound("level-up", "/sounds/level-up.wav");
loadSound("max-corruption", "/sounds/max-corruption.wav");
loadSound("max-corruption-explotion", "/sounds/max-corruption-explotion.wav");
loadSound("death", "/sounds/death.wav");
loadSound("crystal", "/sounds/crystal.wav");
loadSound("life-orb", "/sounds/life-orb.wav");
loadSound("energy-orb", "/sounds/energy-orb.wav");
loadSound("boss-laser", "/sounds/boss-laser.wav");

scene("menu", () => {
  add([
    text("Lorem ipsum", { size: 48 }),
    fadeIn(0.4),
    opacity(),
    pos(400, 100),
    anchor("center"),
    z(10000),
    color(0, 0, 0),
  ]);

  const startGameText = add([
    text("start", { size: 30 }),
    area(),
    opacity(),
    pos(400, 180),
    anchor("center"),
    z(10000),
    color(Color.BLACK),
    "start-game-text",
  ]);

  let crystalOption = startGameText.add([
    sprite("crystal-option"),
    opacity(0),
    anchor("center"),
    pos(-100, 0),
    scale(0.2),
    "crystal-option",
  ]);

  startGameText.onHover(() => {
    crystalOption.opacity = 1;
    startGameText.color = Color.MAGENTA;
  });

  startGameText.onHoverEnd(() => {
    crystalOption.opacity = 0;
    startGameText.color = Color.BLACK;
  });

  add([sprite("intro-bg")]);
  onClick("start-game-text", () => {
    play("sword-swoosh", { loop: false });

    add([
      rect(width(), height()),
      pos(center()),
      anchor("center"),
      color(Color.BLACK),
      opacity(2),
      fadeIn(2),
      lifespan(2, { fade: 0.5 }),
      z(10000),
    ]);

    wait(1.8, () => {
      go("game");
    });
  });
});

scene("game", () => {
  addBackground();
  addWorldBounds();
  spawnRandomWalls();
  setCursor("none");

  let currentWaveText = add([
    text(`Wave: ${gameState.currentWave}`, { size: 16 }),
    pos(GAME.CANVAS_WIDTH - 9, 12),
    anchor("topright"),
    fixed(),
    z(10000),
  ]);

  let currentMobsKilledText = add([
    text(`Slayed: ${gameState.totalMobsKilled}`, { size: 16 }),
    pos(GAME.CANVAS_WIDTH - 9, 32),
    anchor("topright"),
    fixed(),
    z(10000),
  ]);

  let mobsUntileNextWaveText = add([
    text(`Next wave in: ${gameState.mobsToBeKilledUntilNextWave}`, {
      size: 16,
    }),
    pos(GAME.CANVAS_WIDTH - 9, 52),
    anchor("topright"),
    fixed(),
    z(10000),
  ]);

  // debug.inspect = true;

  const player = initPlayer();
  // gameState.gameStarted = true;
  // TODO: Enable intro
  wait(5, () => {
    player.add([
      text(
        "[black]Run. Resist. Before the [/black][purple]corruption[/purple][black] \n \n takes everything[/black]",
        {
          size: 26,
          width: width() - 100,
          styles: {
            purple: {
              color: Color.fromArray(CORRUPTION_COLOR),
            },
            black: {
              color: Color.BLACK,
            },
          },
        }
      ),
      anchor("center"),
      opacity(1),
      pos(20, -100),
      lifespan(7, {
        fade: 0.5,
      }),

      fadeIn(0.5),
      // scale(0.5),
    ]);
  });

  wait(15, () => {
    // Todo intro here lalala...

    gameState.gameStarted = true;
  });

  // MAIN GAME LOOP FOR MOBS
  let mobTimers = {
    perinola: 0,
    fast: 0,
    mid: 0,
    hard: 0,
  };

  onUpdate(() => {
    if (!player.exists() || !gameState.gameStarted) return;

    const dtVal = dt();

    // Helper to try spawning a mob, only if we're under the cap
    function trySpawnMob(timerName, cooldownRange, spawnFn) {
      console.log("Spawning mob. Current:", gameState.currentMobs);
      mobTimers[timerName] -= dtVal;

      if (
        mobTimers[timerName] <= 0 &&
        gameState.currentMobs < gameState.maxCurrentMobs
      ) {
        const { x, y } = getMobRandomPos(player.pos);
        spawnFn(x, y);
        gameState.currentMobs++;

        mobTimers[timerName] = rand(...cooldownRange);
      }
    }

    if (gameState.currentWave >= 1) {
      trySpawnMob(
        "perinola",
        [gameState.mobsSpawnTime * 1.5, gameState.mobsSpawnTime * 3],
        initPerinolaEnemy
      );
    }

    if (gameState.currentWave >= 3) {
      trySpawnMob(
        "fast",
        [gameState.mobsSpawnTime * 2, gameState.mobsSpawnTime * 4],
        initFastEnemy
      );
    }

    if (gameState.currentWave >= 10) {
      trySpawnMob(
        "mid",
        [gameState.mobsSpawnTime * 3, gameState.mobsSpawnTime * 5],
        initMidEnemy
      );
    }

    if (gameState.currentWave >= 20) {
      trySpawnMob(
        "hard",
        [gameState.mobsSpawnTime * 5, gameState.mobsSpawnTime * 10],
        initHardEnemy
      );
    }
  });

  onUpdate(() => {
    if (gameState.mobsToBeKilledUntilNextWave <= gameState.totalMobsKilled) {
      gameState.currentWave += 1;
      gameState.mobsToBeKilledUntilNextWave = Math.round(
        gameState.mobsToBeKilledUntilNextWave * 1.5
      );
      gameState.mobsSpawnTime *= 0.95;
    }

    currentWaveText.text = `Wave: ${gameState.currentWave}`;
    currentMobsKilledText.text = `Slayed: ${gameState.totalMobsKilled}`;
    mobsUntileNextWaveText.text = `Next wave in: ${
      gameState.mobsToBeKilledUntilNextWave - gameState.totalMobsKilled
    }`;
  });

  onUpdate(() => {
    if (!player.exists()) return;

    const halfW = width() / 2;
    const halfH = height() / 2;

    const camX = clamp(player.pos.x, halfW, GAME.MAX_GAME_WIDTH - halfW);
    const camY = clamp(player.pos.y, halfH, GAME.MAX_GAME_HEIGHT - halfH);

    setCamPos(camX, camY);
    setCamScale(1);
  });
});

go("menu");
