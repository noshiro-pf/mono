import { union } from '../compose/index.mjs';
import { undefinedType } from '../primitives/index.mjs';
import { type Type } from '../type.mjs';

export const nullable = <T,>(type: Type<T>): Type<T | undefined> =>
  union([type, undefinedType]);
