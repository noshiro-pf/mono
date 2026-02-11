import { Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createAssertFn, createCastFn } from '../utils/index.mjs';

export const unknown = (defaultValue?: unknown): Type<unknown> =>
  ({
    typeName: 'unknown',
    get defaultValue() {
      return defaultValue;
    },
    is,
    fill: (a) => a,
    validate,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  }) as const;

const validate: Type<unknown>['validate'] = Result.ok;

const is = (_a: unknown): _a is unknown => true;
