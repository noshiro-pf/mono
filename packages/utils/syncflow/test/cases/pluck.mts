import {
  interval,
  map,
  pluck,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  pluck$: Observable<string>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(5));

  const pluck$ = counter$
    .chain(map((i) => ({ x: i.toString() })))
    .chain(pluck('x'));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    pluck$,
  };
};

export const pluckTestCases: readonly [StreamTestCase<string>] = [
  {
    name: 'pluck case 1',
    expectedOutput: ['0', '1', '2', '3', '4'],
    run: (tick: number): Promise<readonly string[]> => {
      const { startSource, pluck$ } = createStreams(tick);
      return getStreamOutputAsPromise(pluck$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, pluck$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      pluck$.subscribe((a) => {
        console.log('pluck  ', a);
      });

      startSource();
    },
  },
];
