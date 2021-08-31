import type { Observable } from '../src';

export const getStreamOutputAsPromise = <T>(
  stream$: Observable<T>,
  startSource: () => void
): Promise<readonly T[]> => {
  const ret = new Promise<readonly T[]>((resolve) => {
    const output: T[] = [];
    const subscription = stream$.subscribe(
      (a) => {
        output.push(a);
      },
      () => {
        subscription.unsubscribe();
        resolve(output);
      }
    );

    startSource();
  });

  return ret;
};
