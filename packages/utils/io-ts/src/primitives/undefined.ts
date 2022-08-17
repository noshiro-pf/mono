import { isUndefined } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from '../utils';

export const undefinedType: Type<undefined> = createPrimitiveType({
  typeName: 'undefined',
  defaultValue: undefined,
  is: isUndefined,
});
