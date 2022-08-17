import { Json, Result } from '@noshiro/ts-utils';

export const validationErrorMessage = (
  a: unknown,
  prefix: string,
  suffix: (s: string) => string = (s) => `but it is actually '${s}'`
): string => {
  const stringifyResult = Json.stringify(a);

  if (Result.isErr(stringifyResult)) {
    return `${prefix}, but it isn't (stringification failed).`;
  }

  const str = stringifyResult.value;

  return `${prefix}, ${suffix(str)}.`;
};
