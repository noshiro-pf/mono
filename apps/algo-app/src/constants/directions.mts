import { type NWES } from '../types/index.mjs';

export const directions = [
  'S',
  'W',
  'N',
  'E',
] as const satisfies readonly NWES[];
