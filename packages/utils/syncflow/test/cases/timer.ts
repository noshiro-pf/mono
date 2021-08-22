import type { DeepReadonly } from '@noshiro/ts-utils';
import type { Observable } from '../../src';
import { combineLatest, interval, take, timer } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  timer1$: Observable<number>;
  timer2$: Observable<number>;
  counter$: Observable<number>;
  combined$: Observable<readonly [number, number, number]>;
}> => {
  const timer1$ = timer(tick, true);
  const timer2$ = timer(tick * 2, true);
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(3));
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
  StreamTestCase<[number, number, number]>
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
      [0, 0, 1],
      [0, 0, 2],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number, number][]>> => {
      const { combined$, startSource } = createStreams(tick);
      return getStreamOutputAsPromise(combined$, startSource);
    },
    preview: (tick: number): void => {
      const { timer1$, timer2$, combined$, startSource } = createStreams(tick);
      timer1$.subscribe((a) => {
        console.log('timer1', a);
      });
      timer2$.subscribe((a) => {
        console.log('timer2', a);
      });
      combined$.subscribe((a) => {
        console.log('combined', a);
      });
      startSource();
    },
  },
];
