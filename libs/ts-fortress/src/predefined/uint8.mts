import { uintRange } from '../enum/index.mjs';
import { type Type } from '../type.mjs';

export const uint8 = (defaultValue: Uint8 = 0): Type<Uint8> =>
  uintRange({
    start: 0,
    end: 256,
    defaultValue,
  });
