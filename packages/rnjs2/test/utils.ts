import { RN } from '../src/abstract_class';
import { TICK } from './constants';
import { StreamTestCase } from './typedef';

export const getStreamOutputAsPromise = <T>(
  stream$: RN<T>,
  take: number,
  startSource: () => void,
  stopSource?: () => void
): Promise<T[]> =>
  new Promise((resolve) => {
    const output: T[] = [];
    stream$.subscribe((a) => {
      output.push(a);
      if (output.length >= take) {
        if (stopSource != null) stopSource();
        resolve(output);
      }
    });

    startSource();
  });

export const testStream = <T>(
  testCase: StreamTestCase<T>,
  expected: T[]
): void => {
  test(testCase.name, () =>
    testCase
      .run(expected.length, TICK.test)
      .then((result) => expect(result).toEqual(expected))
  );
};

export const isInRange = (array: readonly any[], idx: number): boolean =>
  0 <= idx && idx < array.length;
