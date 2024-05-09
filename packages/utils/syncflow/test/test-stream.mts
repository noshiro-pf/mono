import { expect, test } from 'vitest';
import { TICK } from './constants.mjs';
import { type StreamTestCase } from './typedef.mjs';

export const testStream = <T,>(testCase: StreamTestCase<T>): void => {
  test(testCase.name, () =>
    testCase.run(TICK.test).then((result) => {
      expect(result).toStrictEqual(testCase.expectedOutput);
    }),
  );
};
