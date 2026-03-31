import { collectToArray, type Observable } from '../src/index.mjs';

export const getStreamHistoryAsPromise = <T,>(
  observable$: Observable<T>,
  startSource: () => void,
): Promise<readonly T[]> => {
  const ret = collectToArray(observable$);

  startSource();

  return ret;
};
