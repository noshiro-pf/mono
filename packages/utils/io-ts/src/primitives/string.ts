import { isString } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from '../utils';

export const string = (defaultValue: string): Type<string> =>
  createPrimitiveType({ typeName: 'string', defaultValue, is: isString });

export const stringLiteral = <L extends string>(literal: L): Type<L> =>
  createPrimitiveType({
    typeName: `stringLiteral(${literal})`,
    defaultValue: literal,
    is: (value: unknown): value is L => value === literal,
  });
