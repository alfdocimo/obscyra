import { Color, GameObj } from "kaplay";

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
        speed: [300, 400], // 🔥 faster burst
        angle: [120, 360], // or narrow it like [250, 290] for cone
        angularVelocity: [300, 360], // 🎯 more spin = more energy
        lifeTime: [0.3, 0.6], // ⏱️ fast fade
        colors,
        opacities: [1.0, 0.6, 0.0], // 🚀 punch then fade
        scales: [
          rand(0.4, 1.0), // start small or mid
          rand(1.0, 2.0), // pop!
          rand(0.2, 0.5), // fade out small
        ],
        texture: getSprite("purple-particle").data.tex,
        quads: [getSprite("purple-particle").data.frames[0]],
      },
      {
        lifetime: 0.6,
        rate: 0, // still manual burst
        direction: rand(250, 290), // 💨 tighter directional burst
        spread: 80, // still a bit wild
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
        speed: [300, 400], // 🔥 faster burst
        angle: [120, 360], // or narrow it like [250, 290] for cone
        angularVelocity: [300, 360], // 🎯 more spin = more energy
        lifeTime: [0.3, 0.6], // ⏱️ fast fade
        colors,
        opacities: [1.0, 0.6, 0.0], // 🚀 punch then fade
        scales: [
          rand(0.4, 1.0), // start small or mid
          rand(1.0, 2.0), // pop!
          rand(0.2, 0.5), // fade out small
        ],
        texture: getSprite("purple-particle").data.tex,
        quads: [getSprite("purple-particle").data.frames[0]],
      },
      {
        lifetime: 0.6,
        rate: 0, // still manual burst
        direction: rand(250, 290), // 💨 tighter directional burst
        spread: 80, // still a bit wild
      }
    ),
  ]);

  return parts;
}
