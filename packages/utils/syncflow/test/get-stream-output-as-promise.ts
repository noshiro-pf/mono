import { type Observable } from '../src';

export const getStreamOutputAsPromise = <T>(
  observable$: Observable<T>,
  startSource: () => void
): Promise<readonly T[]> => {
  const ret = new Promise<readonly T[]>((resolve) => {
    const mut_output: T[] = [];
    const subscription = observable$.subscribe(
      (a) => {
        mut_output.push(a);
      },
      () => {
        subscription.unsubscribe();
        resolve(mut_output);
      }
    );

    startSource();
  });

  return ret;
};
