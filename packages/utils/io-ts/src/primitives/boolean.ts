import { isBoolean } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from './primitive-type';

export const boolean = (defaultValue: boolean): Type<boolean> =>
  createPrimitiveType({ is: isBoolean, defaultValue });

export const booleanLiteral = <L extends boolean>(literal: L): Type<L> =>
  createPrimitiveType({
    is: (value: unknown): value is L => value === literal,
    defaultValue: literal,
  });
