import { Result } from '@noshiro/ts-utils';
import { type Type } from './type.mjs';
import { createAssertFn, createCastFn } from './utils/index.mjs';

export const unknown = (defaultValue?: unknown): Type<unknown> => ({
  typeName: 'unknown',
  defaultValue,
  is,
  fill: (a) => a,
  validate,
  assertIs: createAssertFn(validate),
  cast: createCastFn(validate),
});

const validate: Type<unknown>['validate'] = Result.ok;

const is = (_a: unknown): _a is unknown => true;
