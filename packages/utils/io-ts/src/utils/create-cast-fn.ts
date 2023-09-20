import { Result } from '@noshiro/ts-utils';
import { type Type } from '../type';

const validationResultToString = (result: readonly string[]): string =>
  `\n${result.join(',\n')}`;

export const createCastFn =
  <T>(validate: Type<T>['validate']) =>
  (a: unknown): T => {
    const res = validate(a);
    if (Result.isErr(res)) {
      throw new Error(validationResultToString(res.value));
    }
    return res.value;
  };
