import { Result } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import { type Type } from '../type.mjs';
import { validationErrorsToMessages } from './validation-error.mjs';

export const createCastFn =
  <T,>(validate: Type<T>['validate']) =>
  (a: unknown): T => {
    const res = validate(a);

    if (Result.isErr(res)) {
      panic(validationErrorsToMessages(res.value).join('\n'));
    }

    // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return a as T;
  };
