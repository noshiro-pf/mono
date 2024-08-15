import { detailedDiff } from 'deep-object-diff';

type DetailedDiffResult<T> = Readonly<{
  added: DeepPartial<T>;
  deleted: DeepPartial<T>;
  updated: DeepPartial<T>;
}>;

// eslint-disable-next-line @typescript-eslint/no-restricted-types
export const deepObjectDiff = <T extends object>(
  a: T,
  b: T,
): DetailedDiffResult<T> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  detailedDiff(a, b) as DetailedDiffResult<T>;
