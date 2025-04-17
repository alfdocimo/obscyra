import kaplay from "kaplay";
import "kaplay/global";
import { initPlayer, player } from "./entities/player";
import { initGhosty } from "./entities/ghosty";
import { initTinyGhosty } from "./entities/tiny-ghosty";
import { initGigagantrum } from "./entities/gigagantrum";
import { GAME } from "./config";
import getMobRandomPos from "./utils/get-mob-random-pos";
import { addBackground, addWorldBounds, spawnRandomWalls } from "./level";
import { gameState } from "./game-state";

// @ts-check

// Use state() component to handle basic AI

kaplay({
  root: document.querySelector("#game-container"),
  width: GAME.CANVAS_WIDTH,
  height: GAME.CANVAS_HEIGHT,
  scale: 1,
});

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

loadSprite("player-stats", "/sprites/test-ui-stats-2.png");

loadSprite("player-skills-ui", "/sprites/test-player-skills-ui-2.png");

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

scene("menu", () => {
  add([text("Press Enter to Start", { size: 48 }), pos(0, 0), color(0, 0, 0)]);
  onKeyPress("enter", () => {
    go("game");
  });
});

scene("game", () => {
  addBackground();
  addWorldBounds();
  spawnRandomWalls();

  // debug.inspect = true;

  const player = initPlayer();

  loop(gameState.mobsSpawnTime, () => {
    if (!player.exists()) return;

    if (gameState.currentMobs >= gameState.maxCurrentMobs) return;

    let { x, y } = getMobRandomPos(player.pos);
    initGhosty(x, y);
    gameState.currentMobs++;
    gameState.totalMobsSpawned++;
  });

  onUpdate(() => {
    if (gameState.mobsToBeKilledUntilNextWave <= gameState.totalMobsKilled) {
      gameState.currentWave += 1;
      gameState.mobsToBeKilledUntilNextWave = Math.round(
        gameState.mobsToBeKilledUntilNextWave * 1.5
      );
      gameState.mobsSpawnTime *= 0.95;
    }
  });

  // loop(1, () => {
  //   if (!player.exists()) return;

  //   let { x, y } = getMobRandomPos(player.pos);

  //   initTinyGhosty(x, y);
  // });

  // loop(10, () => {
  //   if (!player.exists()) return;

  //   let { x, y } = getMobRandomPos(player.pos);

  //   initGigagantrum(x, y);
  // });

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
