import { Result } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import { type Type } from '../type.mjs';
import {
  validationErrorsToMessages,
  type ValidationError,
} from './validation-error.mjs';

const validationResultToString = (result: readonly ValidationError[]): string =>
  `\n${validationErrorsToMessages(result).join(',\n')}` as const;

export const createAssertFn =
  <T,>(validate: Type<T>['validate']) =>
  (a: unknown): asserts a is T => {
    const res = validate(a);

    if (Result.isErr(res)) {
      panic(validationResultToString(res.value));
    }
  };
