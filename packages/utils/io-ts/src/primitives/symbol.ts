import { isSymbol } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from './primitive-type';

export const symbol = <D extends symbol>(defaultValue: D): Type<symbol, D> =>
  createPrimitiveType({ is: isSymbol, defaultValue });
