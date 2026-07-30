import { type Int8 } from 'ts-type-forge';
import { intRange } from '../enum/index.mjs';
import { type Type } from '../type.mjs';

export const int8 = (defaultValue: Int8 = 0): Type<Int8> =>
  intRange(-128, 128, { defaultValue });
