import {
  interval,
  map,
  take,
  withLatestFrom,
  type Observable,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import { type StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  withLatest$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(11));

  const double$ = counter$.chain(map((x) => x * 2));
  const withLatest$ = counter$.chain(withLatestFrom(double$));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    withLatest$,
  };
};

export const withLatestFromTestCases: readonly [
  StreamTestCase<[number, number]>,
] = [
  {
    name: 'withLatestFrom case 1',
    expectedOutput: [
      [0, 0],
      [1, 2],
      [2, 4],
      [3, 6],
      [4, 8],
      [5, 10],
      [6, 12],
      [7, 14],
      [8, 16],
      [9, 18],
      [10, 20],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, withLatest$ } = createStreams(tick);
      return getStreamOutputAsPromise(withLatest$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, withLatest$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter   ', a);
      });
      withLatest$.subscribe((a) => {
        console.log('withLatest', a);
      });

      startSource();
    },
  },
];
