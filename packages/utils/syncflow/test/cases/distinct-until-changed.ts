import {
  distinctUntilChanged,
  interval,
  map,
  take,
  withLatestFrom,
  type Observable,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import { type StreamTestCase } from '../typedef';

/*
  counter                0   1   2   3   4   5   6
  distinctUntilChanged   0           1           2
  withLatest             00  1   2   31  4   5   6
*/

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  distinctUntilChanged$: Observable<number>;
  withLatest$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(10));

  const distinctUntilChanged$ = counter$
    .chain(map((i) => Math.floor(i / 3)))
    .chain(distinctUntilChanged());

  const withLatest$ = distinctUntilChanged$.chain(withLatestFrom(counter$));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    distinctUntilChanged$,
    withLatest$,
  };
};

export const distinctUntilChangedTestCases: readonly [
  StreamTestCase<[number, number]>
] = [
  {
    name: 'distinctUntilChanged case 1',
    expectedOutput: [
      [0, 0],
      [1, 3],
      [2, 6],
      [3, 9],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, withLatest$ } = createStreams(tick);
      return getStreamOutputAsPromise(withLatest$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, distinctUntilChanged$, withLatest$ } =
        createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter             ', a);
      });
      distinctUntilChanged$.subscribe((a) => {
        console.log('distinctUntilChanged', a);
      });
      withLatest$.subscribe((a) => {
        console.log('withLatest          ', a);
      });

      startSource();
    },
  },
];
