import { Result } from '@noshiro/ts-utils';

export const createIsFnFromValidateFn =
  <T>(validate: (o: unknown) => Result<void, readonly string[]>) =>
  (a: unknown): a is T =>
    Result.isOk(validate(a));
