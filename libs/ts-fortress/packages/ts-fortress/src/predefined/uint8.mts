import { type Uint8 } from 'ts-type-forge';
import { uintRange } from '../enum/index.mjs';
import { type Type } from '../type.mjs';

export const uint8 = (defaultValue: Uint8 = 0): Type<Uint8> =>
  uintRange(0, 256, { defaultValue });
