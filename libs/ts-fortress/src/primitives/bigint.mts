import { isBigint } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const bigint = (defaultValue: bigint = 0n): Type<bigint> =>
  createPrimitiveType({ typeName: 'bigint', defaultValue, is: isBigint });
