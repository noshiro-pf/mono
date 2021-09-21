import { Result } from '../functional';

export const promiseToResult = <S, E = unknown>(
  promise: Readonly<Promise<S>>
): Promise<Result<S, E>> =>
  promise.then(Result.ok).catch((err) => Result.err(err as E));
