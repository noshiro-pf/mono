import { Result } from '@noshiro/ts-utils';
import { type Type } from '../type';

const validationResultToString = (result: readonly string[]): string =>
  `\n${result.join(',\n')}`;

export const createAssertFn =
  <T>(validate: Type<T>['validate']) =>
  (a: unknown): asserts a is T => {
    const res = validate(a);
    if (Result.isErr(res)) {
      throw new Error(validationResultToString(res.value));
    }
  };
