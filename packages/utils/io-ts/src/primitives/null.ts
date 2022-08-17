import { isNull } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from '../utils';

export const nullType: Type<null> = createPrimitiveType({
  typeName: 'null',
  defaultValue: null,
  is: isNull,
});
