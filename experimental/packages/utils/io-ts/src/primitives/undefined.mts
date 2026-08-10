import { isUndefined } from '@noshiro/ts-utils';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const undefinedType: Type<undefined> = createPrimitiveType({
  typeName: 'undefined',
  defaultValue: undefined,
  is: isUndefined,
});
