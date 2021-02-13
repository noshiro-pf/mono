import { Observable } from '../src';

export const getStreamOutputAsPromise = <T>(
  stream$: Observable<T>,
  take: number,
  startSource: () => void,
  stopSource?: () => void
): Promise<T[]> =>
  new Promise((resolve) => {
    const output: T[] = [];
    stream$.subscribe((a) => {
      output.push(a);
      if (output.length >= take) {
        if (stopSource !== undefined) stopSource();
        resolve(output);
      }
    });

    startSource();
  });
