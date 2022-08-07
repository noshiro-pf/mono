import { Result } from '@noshiro/ts-utils';

const validationResultToString = (result: readonly string[]): string =>
  `\n${result.join(',\n')}`;

export const createAssertFunction =
  <T>(validate: (o: unknown) => Result<void, readonly string[]>) =>
  (a: unknown): asserts a is T => {
    const res = validate(a);
    if (Result.isErr(res)) {
      throw new Error(validationResultToString(res.value));
    }
  };
