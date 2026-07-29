import { isBigint, isString } from 'ts-data-forge';
import { type Primitive } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const literal = <
  L extends Extract<Primitive, string | number | bigint | boolean>,
>(
  value: L,
): Type<L> =>
  createPrimitiveType({
    typeName: isString(value)
      ? `"${value}"`
      : isBigint(value)
        ? `${value}n`
        : value.toString(),
    defaultValue: value,
    is: (u: unknown): u is L => u === value,
  });
