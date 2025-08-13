import { Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';

export const createIsFn =
  <T,>(validate: Type<T>['validate']) =>
  (a: unknown): a is T =>
    Result.isOk(validate(a));
