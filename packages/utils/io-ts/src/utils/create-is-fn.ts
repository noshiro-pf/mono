import { Result } from '@noshiro/ts-utils';
import { type Type } from '../type';

export const createIsFn =
  <T>(validate: Type<T>['validate']) =>
  (a: unknown): a is T =>
    Result.isOk(validate(a));
