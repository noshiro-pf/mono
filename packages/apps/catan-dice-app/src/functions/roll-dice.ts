export const rollTwoDices = (): readonly [
  NumberType.ArraySize,
  NumberType.ArraySize,
] => [Uint32.random(1, 6), Uint32.random(1, 6)];
