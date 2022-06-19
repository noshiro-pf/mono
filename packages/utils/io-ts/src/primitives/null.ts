import { isNull } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from './primitive-type';

export const nullType: Type<null, null> = createPrimitiveType({
  is: isNull,
  defaultValue: null,
});
