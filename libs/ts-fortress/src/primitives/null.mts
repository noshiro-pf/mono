import { isNull } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

// @sumi-expect-error null/no-null-in-type
export const nullType: Type<null> = createPrimitiveType({
  typeName: 'null',
  // @sumi-expect-error null/no-null-literal
  defaultValue: null,
  is: isNull,
});
