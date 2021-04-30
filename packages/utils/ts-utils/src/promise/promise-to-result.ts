import { Result } from '../functional';

export const promiseToResult = <S, E = unknown>(
  promise: Readonly<Promise<S>>
): Promise<Result<S, E>> => promise.then(Result.ok).catch(Result.err);
