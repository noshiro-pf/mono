import { Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { validationErrorsToMessages } from './validation-error.mjs';

export const createCastFn =
  <T,>(validate: Type<T>['validate']) =>
  (a: unknown): T => {
    const res = validate(a);

    if (Result.isErr(res)) {
      throw new Error(validationErrorsToMessages(res.value).join('\n'));
    }

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return a as T;
  };
