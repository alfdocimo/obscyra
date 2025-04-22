import { GameObj } from "kaplay";

export function addFadingText({
  gameObj,
  txt,
  txtColor = [255, 255, 255],
  fadeDuration = 0.2,
  size = 16,
}: {
  gameObj: GameObj;
  txt: string;
  txtColor?: number[];
  fadeDuration?: number;
  size?: number;
}) {
  let textAnimation = gameObj.add([
    text(txt, { size }),
    animate(),
    pos(0, 0),
    opacity(1),
    anchor("center"),
    color(Color.fromArray(txtColor)),
    lifespan(fadeDuration, { fade: 0.2 }),
    z(3000),
  ]);
  textAnimation.animate(
    "pos",
    [
      vec2(textAnimation.pos),
      vec2(textAnimation.pos.x, textAnimation.pos.y - 50),
    ],
    { duration: 0.2, loops: 1 }
  );
}

export function addFadingNumber({
  gameObj,
  number,
  txtColor = [255, 255, 255],
  fadeDuration = 0.2,
  size = 16,
}: {
  gameObj: GameObj;
  number: number;
  txtColor?: number[];
  fadeDuration?: number;
  size?: number;
}) {
  let damageTakenText = gameObj.add([
    text(`${Math.round(number)}`, { size }),
    animate(),
    pos(0, 0),
    anchor("center"),
    opacity(1),
    color(Color.fromArray(txtColor)),
    lifespan(fadeDuration, { fade: 0.2 }),
    z(3000),
  ]);
  damageTakenText.animate(
    "pos",
    [
      vec2(damageTakenText.pos),
      vec2(damageTakenText.pos.x, damageTakenText.pos.y - 50),
    ],
    { duration: 0.2, loops: 1 }
  );
}

export function addFadingNumberAtPos({
  x,
  y,
  number,
  txtColor = [255, 255, 255],
  fadeDuration = 0.2,
  size = 16,
}: {
  x: number;
  y: number;
  number: number;
  txtColor?: number[];
  fadeDuration?: number;
  size?: number;
}) {
  let damageTakenText = add([
    text(`${Math.round(number)}`, { size }),
    animate(),
    pos(x, y),
    anchor("center"),
    opacity(1),
    color(Color.fromArray(txtColor)),
    lifespan(fadeDuration, { fade: 0.2 }),
    z(3000),
  ]);
  damageTakenText.animate(
    "pos",
    [
      vec2(damageTakenText.pos),
      vec2(damageTakenText.pos.x, damageTakenText.pos.y - 50),
    ],
    { duration: 0.2, loops: 1 }
  );
}
