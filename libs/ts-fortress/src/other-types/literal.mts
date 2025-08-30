import { isBigint, isString } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const literal = <
  L extends Extract<Primitive, string | number | bigint | boolean>,
>(
  value: L,
): Type<L> =>
  createPrimitiveType({
    typeName: isString(value)
      ? `literal("${value}")`
      : isBigint(value)
        ? `literal(${value}n)`
        : `literal(${value})`,
    defaultValue: value,
    is: (u: unknown): u is L => u === value,
  });
