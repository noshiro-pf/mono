import { isString } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from './primitive-type';

export const string = <D extends string>(defaultValue: D): Type<string, D> =>
  createPrimitiveType({ is: isString, defaultValue });

export const stringLiteral = <L extends string>(literal: L): Type<L, L> =>
  createPrimitiveType({
    is: (value: unknown): value is L => value === literal,
    defaultValue: literal,
  });
