import kaplay from "kaplay";
import "kaplay/global";
import { initPlayer, player } from "./entities/player";
import { initEnemy } from "./entities/enemy";
import { GAME } from "./config";
import getMobRandomPos from "./utils/get-mob-random-pos";

// @ts-check

// Use state() component to handle basic AI

kaplay({
  root: document.querySelector("#game-container"),
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  scale: 1,
  background: [0, 0, 0],
});

loadSprite("bean", "/sprites/bean.png");
loadSprite("ghosty", "/sprites/ghosty.png");

initPlayer();

// Main game loop
loop(2, () => {
  if (!player.exists()) return;

  let { x, y } = getMobRandomPos();
  initEnemy(x, y);
});
