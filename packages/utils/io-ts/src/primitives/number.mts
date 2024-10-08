import { isNumber } from '@noshiro/ts-utils';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const number = (defaultValue: number = 0): Type<number> =>
  createPrimitiveType({ typeName: 'number', defaultValue, is: isNumber });

export const numberLiteral = <L extends number>(literal: L): Type<L> =>
  createPrimitiveType({
    typeName: `numberLiteral(${literal})`,
    defaultValue: literal,
    is: (value: unknown): value is L => value === literal,
  });
