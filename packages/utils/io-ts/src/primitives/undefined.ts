import { isUndefined } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from './primitive-type';

export const undefinedType: Type<undefined> = createPrimitiveType({
  is: isUndefined,
  defaultValue: undefined,
});
