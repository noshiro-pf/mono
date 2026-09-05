import { Uint32 } from 'ts-data-forge';

export const rollTwoDices = (): readonly [Uint32, Uint32] =>
  [Uint32.random(1, 6), Uint32.random(1, 6)] as const;
