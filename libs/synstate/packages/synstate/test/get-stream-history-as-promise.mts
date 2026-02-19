import { type Observable } from '../src/index.mjs';

export const getStreamHistoryAsPromise = <T,>(
  observable$: Observable<T>,
  startSource: () => void,
): Promise<readonly T[]> => {
  const ret = new Promise<readonly T[]>((resolve) => {
    const mut_history: T[] = [];

    const subscription = observable$.subscribe(
      (a) => {
        mut_history.push(a);
      },
      () => {
        subscription.unsubscribe();

        resolve(mut_history);
      },
    );

    startSource();
  });

  return ret;
};
