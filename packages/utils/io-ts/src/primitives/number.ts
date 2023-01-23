import { isNumber } from '@noshiro/ts-utils';
import { type Type } from '../type';
import { createPrimitiveType } from '../utils';

export const number = (defaultValue: number): Type<number> =>
  createPrimitiveType({ typeName: 'number', defaultValue, is: isNumber });

export const numberLiteral = <L extends number>(literal: L): Type<L> =>
  createPrimitiveType({
    typeName: `numberLiteral(${literal})`,
    defaultValue: literal,
    is: (value: unknown): value is L => value === literal,
  });
