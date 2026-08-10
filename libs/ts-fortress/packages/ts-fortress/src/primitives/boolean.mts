import { isBoolean } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export const boolean = (defaultValue: boolean = false): Type<boolean> =>
  createPrimitiveType({ typeName: 'boolean', defaultValue, is: isBoolean });
