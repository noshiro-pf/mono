import { Result } from 'ts-data-forge';

export const requirePositive = (n: number): Result<number, string> =>
  n <= 0 ? Result.err('must be positive') : Result.ok(n);
