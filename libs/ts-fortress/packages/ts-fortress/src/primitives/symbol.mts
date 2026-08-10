import { isSymbol } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const symbol = (defaultValue: symbol): Type<symbol> =>
  createPrimitiveType({
    typeName: 'symbol',
    defaultValue,
    is: isSymbol,
  });
