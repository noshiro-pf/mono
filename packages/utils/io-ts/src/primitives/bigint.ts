import { isBigint } from '@noshiro/ts-utils';
import { type Type } from '../type';
import { createPrimitiveType } from '../utils';

export const bigint = (defaultValue: bigint): Type<bigint> =>
  createPrimitiveType({ typeName: 'bigint', defaultValue, is: isBigint });

export const bigintLiteral = <L extends bigint>(literal: L): Type<L> =>
  createPrimitiveType({
    typeName: `bigintLiteral(${literal})`,
    defaultValue: literal,
    is: (value: unknown): value is L => value === literal,
  });
