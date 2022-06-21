import { isString } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from './primitive-type';

export const string = (defaultValue: string): Type<string> =>
  createPrimitiveType({ is: isString, defaultValue });

export const stringLiteral = <L extends string>(literal: L): Type<L> =>
  createPrimitiveType({
    is: (value: unknown): value is L => value === literal,
    defaultValue: literal,
  });
