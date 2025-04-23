import { Color, GameObj, PosComp, Vec2 } from "kaplay";

export function spawnParticlesAtGameObj({
  gameObj,
  colors = [rgb(255, 255, 255)],
}: {
  gameObj: GameObj;
  colors?: Color[];
}) {
  const parts = gameObj.add([
    particles(
      {
        max: 30,
        speed: [300, 400],
        angle: [120, 360],
        angularVelocity: [300, 360],
        lifeTime: [0.3, 0.6],
        colors,
        opacities: [1.0, 0.6, 0.0],
        scales: [rand(0.4, 1.0), rand(1.0, 2.0), rand(0.2, 0.5)],
        texture: getSprite("purple-particle").data.tex,
        quads: [getSprite("purple-particle").data.frames[0]],
      },
      {
        lifetime: 0.6,
        rate: 0,
        direction: rand(250, 290),
        spread: 80,
      }
    ),
  ]);

  return parts;
}

export function spawnParticlesAtPosition({
  x,
  y,
  colors = [rgb(255, 255, 255)],
}: {
  x: number;
  y: number;
  colors?: Color[];
}) {
  const parts = add([
    pos(x, y),
    particles(
      {
        max: 30,
        speed: [300, 400],
        angle: [120, 360],
        angularVelocity: [300, 360],
        lifeTime: [0.3, 0.6],
        colors,
        opacities: [1.0, 0.6, 0.0],
        scales: [rand(0.4, 1.0), rand(1.0, 2.0), rand(0.2, 0.5)],
        texture: getSprite("purple-particle").data.tex,
        quads: [getSprite("purple-particle").data.frames[0]],
      },
      {
        lifetime: 0.6,
        rate: 0,
        direction: rand(250, 290),
        spread: 80,
      }
    ),
  ]);

  return parts;
}
export function spawnParticlesAtPlayerDeathPosition({
  x,
  y,
  colors = [
    rgb(255, 255, 255),
    rgb(100, 0, 255),
    rgb(255, 0, 0),
    rgb(0, 255, 255),
  ],
}: {
  x: number;
  y: number;
  colors?: Color[];
}) {
  const parts = add([
    pos(x, y),
    particles(
      {
        max: 120,
        speed: [250, 500],
        angle: [0, 360],
        angularVelocity: [180, 720],
        lifeTime: [0.5, 1.2],
        colors,
        opacities: [1.0, 0.7, 0.0],
        scales: [rand(0.3, 0.6), rand(1.2, 2.5), rand(0.1, 0.4)],
        texture: getSprite("purple-particle").data.tex,
        quads: getSprite("purple-particle").data.frames,
      },
      {
        lifetime: 1.2,
        rate: 0,
        direction: rand(0, 360),
        spread: 360,
      }
    ),
  ]);

  parts.emit(60);
  wait(0.05, () => parts.emit(30));
  wait(0.1, () => parts.emit(20));

  return parts;
}

export function spawnParticlesFromCenter({
  x,
  y,
  colors = [rgb(100, 40, 100), rgb(0, 40, 100)],
}: {
  x: number;
  y: number;
  colors?: Color[];
}) {
  const parts = add([
    pos(x, y),
    particles(
      {
        max: 20,
        speed: [100, 250],
        angle: [0, 360],
        angularVelocity: [180, 720],
        lifeTime: [0.5, 1.2],
        colors,
        opacities: [1.0, 0.7, 0.0],
        scales: [rand(0.2, 0.6), rand(1, 1.3), rand(0.1, 0.4)],
        texture: getSprite("purple-particle").data.tex,
        quads: getSprite("purple-particle").data.frames,
      },
      {
        lifetime: 0.6,
        rate: 0,
        direction: rand(0, 360),
        spread: 360,
      }
    ),
  ]);

  return parts;
}

export function spawnGunParticles({
  posVec2,
  colors = [rgb(255, 240, 200), rgb(255, 200, 100)],
}: {
  posVec2: Vec2;
  colors?: Color[];
}) {
  const parts = add([
    pos(posVec2),
    particles(
      {
        max: 10,
        speed: [100, 180],
        angle: [0, 360],
        angularVelocity: [0, 180],
        lifeTime: [0.15, 0.25],
        colors,
        opacities: [1.0, 0.5, 0.0],
        scales: [rand(0.2, 0.4), rand(0.4, 0.6), rand(0.1, 0.3)],
        texture: getSprite("purple-particle").data.tex,
        quads: getSprite("purple-particle").data.frames,
      },
      {
        lifetime: 0.2,
        rate: 0,
        direction: 0,
        spread: 360,
      }
    ),
  ]);

  return parts;
}
