import { isNumber } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from './primitive-type';

export const number = (defaultValue: number): Type<number> =>
  createPrimitiveType({ is: isNumber, defaultValue });

export const numberLiteral = <L extends number>(literal: L): Type<L> =>
  createPrimitiveType({
    is: (value: unknown): value is L => value === literal,
    defaultValue: literal,
  });
