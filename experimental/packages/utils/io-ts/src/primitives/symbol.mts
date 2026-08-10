import { isSymbol } from '@noshiro/ts-utils';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const symbol = (defaultValue: symbol): Type<symbol> =>
  createPrimitiveType({
    typeName: 'symbol',
    defaultValue,
    is: isSymbol,
  });
