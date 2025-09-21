import { isNumber } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const number = (defaultValue: number = 0): Type<number> =>
  createPrimitiveType({ typeName: 'number', defaultValue, is: isNumber });
