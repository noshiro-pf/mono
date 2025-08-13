import { isBigint } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const bigint = (defaultValue: bigint = 0n): Type<bigint> =>
  createPrimitiveType({ typeName: 'bigint', defaultValue, is: isBigint });

export const bigintLiteral = <L extends bigint>(literal: L): Type<L> =>
  createPrimitiveType({
    typeName: `bigintLiteral(${literal})`,
    defaultValue: literal,
    is: (value: unknown): value is L => value === literal,
  });
