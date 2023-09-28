import { detailedDiff } from 'deep-object-diff';

type DetailedDiffResult<T> = Readonly<{
  added: DeepPartial<T>;
  deleted: DeepPartial<T>;
  updated: DeepPartial<T>;
}>;

// eslint-disable-next-line @typescript-eslint/ban-types
export const deepObjectDiff = <T extends object>(
  a: T,
  b: T
  // eslint-disable-next-line no-restricted-syntax
): DetailedDiffResult<T> => detailedDiff(a, b) as DetailedDiffResult<T>;
