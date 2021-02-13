import { expect, test } from '@jest/globals';
import { TICK } from './constants';
import { StreamTestCase } from './typedef';

export const testStream = <T>(testCase: StreamTestCase<T>): void => {
  test(testCase.name, (done) =>
    testCase
      .run(testCase.expectedOutput.length, TICK.test)
      .then((result) => {
        expect(result).toEqual(testCase.expectedOutput);
        if (done !== undefined) done();
      })
      .catch(console.error)
  );
};
