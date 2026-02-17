import {
  combine,
  interval,
  take,
  timer,
  type Observable,
} from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  Time(ms)  0       200     400     600     800     1000    1200
  Tick      0   1   2   3   4   5   6   7   8   9   10  11  12
  counter   0       1       2       3       4       5       6
  timer1            *                                           (300ms, tick 3)
  timer2                    *                                   (500ms, tick 5)
  combined                  *       *       *       *       *   (tick 5,6,8,10,12)
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

  const counter$ = interval$.pipe(take(7));

  const combined$ = combine([timer1$, timer2$, counter$]);

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
  StreamTestCase<readonly [number, number, number]>,
] = [
  {
    name: 'timer case 1',
    expectedOutput: [0],
    run: (tick: number): Promise<readonly number[]> => {
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
    name: 'timer case 2',
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
