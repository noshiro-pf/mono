import { fromArray, FromArrayObservable } from '../../src/create';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

const createStream = (): FromArrayObservable<number> =>
  fromArray([1, 1, 2, 3, 5, 8, 13, 21, 34, 55]);

export const fromArrayTestCases: [StreamTestCase<number>] = [
  {
    name: 'fromArray case 1',
    numTakeDefault: 9,
    run: (take: number): Promise<number[]> => {
      const source$ = createStream();
      return getStreamOutputAsPromise(source$, take, () => {
        source$.emit();
      });
    },
    preview: (): void => {
      const source$ = createStream();
      source$.subscribe((a) => console.log('fromArray', a));
      source$.emit();
    },
  },
];
