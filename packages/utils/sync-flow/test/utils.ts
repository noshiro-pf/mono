import { Observable } from '../src';
import { TICK } from './constants';
import { StreamTestCase } from './typedef';

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

export const testStream = <T>(testCase: StreamTestCase<T>): void => {
  test(testCase.name, () =>
    testCase.run(testCase.expectedOutput.length, TICK.test).then((result) => {
      expect(result).toEqual(testCase.expectedOutput);
    })
  );
};
