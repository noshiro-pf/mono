import type { FromArrayObservable } from '../../src';
import { fromArray } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import type { StreamTestCase } from '../typedef';

const createStream = (): FromArrayObservable<number> =>
  fromArray([1, 1, 2, 3, 5, 8, 13, 21, 34, 55]);

export const fromArrayTestCases: [StreamTestCase<number>] = [
  {
    name: 'fromArray case 1',
    expectedOutput: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
    run: (take: number): Promise<number[]> => {
      const source$ = createStream();
      return getStreamOutputAsPromise(source$, take, () => {
        source$.emit();
      });
    },
    preview: (): void => {
      const source$ = createStream();
      source$.subscribe((a) => {
        console.log('fromArray', a);
      });
      source$.emit();
    },
  },
];
