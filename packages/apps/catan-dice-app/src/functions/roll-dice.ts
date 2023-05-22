export const rollTwoDices = (): readonly [SafeUint, SafeUint] => [
  SafeUint.random(1, 6),
  SafeUint.random(1, 6),
];
