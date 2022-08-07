import { isSymbol } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from '../utils';

export const symbol = (defaultValue: symbol): Type<symbol> =>
  createPrimitiveType({
    typeName: 'symbol',
    defaultValue,
    is: isSymbol,
  });
