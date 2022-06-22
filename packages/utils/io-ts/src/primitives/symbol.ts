import { isSymbol } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from './primitive-type';

export const symbol = (defaultValue: symbol): Type<symbol> =>
  createPrimitiveType({ is: isSymbol, defaultValue });
