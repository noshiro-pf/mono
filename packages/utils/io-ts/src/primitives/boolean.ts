import { isBoolean } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from './primitive-type';

export const boolean = <D extends boolean>(defaultValue: D): Type<boolean, D> =>
  createPrimitiveType({ is: isBoolean, defaultValue });

export const booleanLiteral = <L extends boolean>(literal: L): Type<L, L> =>
  createPrimitiveType({
    is: (value: unknown): value is L => value === literal,
    defaultValue: literal,
  });
