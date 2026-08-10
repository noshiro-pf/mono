import { isString } from '@noshiro/ts-utils';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const string = (defaultValue: string = ''): Type<string> =>
  createPrimitiveType({ typeName: 'string', defaultValue, is: isString });

export const stringLiteral = <L extends string>(literal: L): Type<L> =>
  createPrimitiveType({
    typeName: `stringLiteral(${literal})`,
    defaultValue: literal,
    is: (value: unknown): value is L => value === literal,
  });
