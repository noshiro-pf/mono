import {
  combineLatest,
  interval,
  take,
  timer,
  type Observable,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import { type StreamTestCase } from '../typedef';

/*
  (tick)    0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19
  counter   0       1       2       3       4       5       6
  timer1                *
  timer2                        *
  combined                      *   *       *       *       *
*/

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  timer1$: Observable<number>;
  timer2$: Observable<number>;
  counter$: Observable<SafeUint>;
  combined$: Observable<readonly [number, number, number]>;
}> => {
  const timer1$ = timer(tick * 3, true);
  const timer2$ = timer(tick * 5, true);
  const interval$ = interval(tick * 2, true);
  const counter$ = interval$.chain(take(7));
  const combined$ = combineLatest([timer1$, timer2$, counter$] as const);

  return {
    startSource: () => {
      timer1$.start();
      timer2$.start();
      interval$.start();
    },
    timer1$,
    timer2$,
    counter$,
    combined$,
  };
};

export const timerTestCases: readonly [
  StreamTestCase<number>,
  StreamTestCase<[number, number, number]>,
] = [
  {
    name: 'timer case 1',
    expectedOutput: [0],
    run: (tick: number): Promise<DeepReadonly<number[]>> => {
      const { timer1$, startSource } = createStreams(tick);
      return getStreamOutputAsPromise(timer1$, startSource);
    },
    preview: (tick: number): void => {
      const { timer1$, startSource } = createStreams(tick);
      timer1$.subscribe((a) => {
        console.log('timer1', a);
      });

      startSource();
    },
  },
  {
    name: 'timer case 1',
    expectedOutput: [
      [0, 0, 2],
      [0, 0, 3],
      [0, 0, 4],
      [0, 0, 5],
      [0, 0, 6],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number, number][]>> => {
      const { combined$, startSource } = createStreams(tick);
      return getStreamOutputAsPromise(combined$, startSource);
    },
    preview: (tick: number): void => {
      const { timer1$, timer2$, combined$, startSource } = createStreams(tick);
      timer1$.subscribe((a) => {
        console.log('timer1  ', a);
      });
      timer2$.subscribe((a) => {
        console.log('timer2  ', a);
      });
      combined$.subscribe((a) => {
        console.log('combined', a);
      });
      startSource();
    },
  },
];
