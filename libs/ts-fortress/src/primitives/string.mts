import { isString } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const string = (defaultValue: string = ''): Type<string> =>
  createPrimitiveType({ typeName: 'string', defaultValue, is: isString });
