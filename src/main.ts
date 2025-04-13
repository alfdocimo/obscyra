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
loadSprite("tiny-ghosty", "/sprites/ghostiny.png");
loadSprite("gigagantrum", "/sprites/gigagantrum.png");
loadSprite("heart", "/sprites/heart.png");
loadSprite("steel", "/sprites/steel.png");
loadSprite("level", "/bg/level.png");

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

  loop(1, () => {
    if (!player.exists()) return;

    if (gameState.currentMobs >= gameState.maxCurrentMobs) return;

    let { x, y } = getMobRandomPos(player.pos);
    initGhosty(x, y);
    gameState.currentMobs++;
    gameState.totalMobsSpawned++;
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
    setCamScale(2);
  });
});

go("menu");
