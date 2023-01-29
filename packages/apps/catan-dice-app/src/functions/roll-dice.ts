export const rollTwoDices = (): readonly [number, number] => [
  Num.randInt(1, 6),
  Num.randInt(1, 6),
];
