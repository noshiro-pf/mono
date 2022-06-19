import { isBigint } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from './primitive-type';

export const bigint = <D extends bigint>(defaultValue: D): Type<bigint, D> =>
  createPrimitiveType({ is: isBigint, defaultValue });

export const bigintLiteral = <L extends bigint>(literal: L): Type<L, L> =>
  createPrimitiveType({
    is: (value: unknown): value is L => value === literal,
    defaultValue: literal,
  });
