import kaplay from "kaplay";
import "kaplay/global";
import { initPlayer, player } from "./entities/player";
import { initGhosty } from "./entities/ghosty";
import { initTinyGhosty } from "./entities/tiny-ghosty";
import { initGigagantrum } from "./entities/gigagantrum";
import { GAME } from "./config";
import getMobRandomPos from "./utils/get-mob-random-pos";
import { addBackground, addWorldBounds, spawnRandomWalls } from "./level";

// @ts-check

// Use state() component to handle basic AI

kaplay({
  root: document.querySelector("#game-container"),
  width: GAME.CANVAS_WIDTH,
  height: GAME.CANVAS_HEIGHT,
  scale: 1,
});

loadSprite("bean", "/sprites/bean.png");
loadSprite("ghosty", "/sprites/ghosty.png");
loadSprite("tiny-ghosty", "/sprites/ghostiny.png");
loadSprite("gigagantrum", "/sprites/gigagantrum.png");
loadSprite("heart", "/sprites/heart.png");
loadSprite("steel", "/sprites/steel.png");
loadSprite("level", "/bg/level.png");

addBackground();
addWorldBounds();
spawnRandomWalls();

initPlayer();

loop(1, () => {
  if (!player.exists()) return;

  let { x, y } = getMobRandomPos(player.pos);
  initGhosty(x, y);
});

loop(1, () => {
  if (!player.exists()) return;

  let { x, y } = getMobRandomPos(player.pos);

  initTinyGhosty(x, y);
});

loop(10, () => {
  if (!player.exists()) return;

  let { x, y } = getMobRandomPos(player.pos);

  initGigagantrum(x, y);
});

onUpdate(() => {
  if (!player.exists()) return;

  const halfW = width() / 2;
  const halfH = height() / 2;

  const camX = clamp(player.pos.x, halfW, GAME.MAX_GAME_WIDTH - halfW);
  const camY = clamp(player.pos.y, halfH, GAME.MAX_GAME_HEIGHT - halfH);

  setCamPos(camX, camY);
});
