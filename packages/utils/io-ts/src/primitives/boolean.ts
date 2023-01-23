import { isBoolean, Str } from '@noshiro/ts-utils';
import { type Type } from '../type';
import { createPrimitiveType } from '../utils';

export const boolean = (defaultValue: boolean): Type<boolean> =>
  createPrimitiveType({ typeName: 'boolean', defaultValue, is: isBoolean });

export const booleanLiteral = <L extends boolean>(literal: L): Type<L> =>
  createPrimitiveType({
    typeName: `booleanLiteral(${Str.from(literal)})`,
    defaultValue: literal,
    is: (value: unknown): value is L => value === literal,
  });
