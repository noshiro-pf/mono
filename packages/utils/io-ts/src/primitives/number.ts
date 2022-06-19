import { isNumber } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from './primitive-type';

export const number = <D extends number>(defaultValue: D): Type<number, D> =>
  createPrimitiveType({ is: isNumber, defaultValue });

export const numberLiteral = <L extends number>(literal: L): Type<L, L> =>
  createPrimitiveType({
    is: (value: unknown): value is L => value === literal,
    defaultValue: literal,
  });
