import { isNull } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const nullType: Type<null> = createPrimitiveType({
  typeName: 'null',
  defaultValue: null,
  is: isNull,
});
