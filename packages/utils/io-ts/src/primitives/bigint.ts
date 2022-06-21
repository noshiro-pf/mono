import { isBigint } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from './primitive-type';

export const bigint = (defaultValue: bigint): Type<bigint> =>
  createPrimitiveType({ is: isBigint, defaultValue });

export const bigintLiteral = <L extends bigint>(literal: L): Type<L> =>
  createPrimitiveType({
    is: (value: unknown): value is L => value === literal,
    defaultValue: literal,
  });
