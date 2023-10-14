import { TICK } from './constants';
import { type StreamTestCase } from './typedef';

export const testStream = <T>(testCase: StreamTestCase<T>): void => {
  test(testCase.name, () =>
    testCase.run(TICK.test).then((result) => {
      expect(result).toStrictEqual(testCase.expectedOutput);
    }),
  );
};
