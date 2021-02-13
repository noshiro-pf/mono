import { interval, IntervalObservable, mapTo, Observable } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  constant$: Observable<string>;
} => {
  const counter$ = interval(tick, true);

  const constant$ = counter$.chain(mapTo('1'));

  return {
    counter$,
    constant$,
  };
};

export const mapToTestCases: [StreamTestCase<string>] = [
  {
    name: 'mapTo case 1',
    expectedOutput: ['1', '1', '1', '1', '1'],
    run: (take: number, tick: number): Promise<string[]> => {
      const { counter$, constant$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        constant$,
        take,
        () => {
          counter$.start();
        },
        () => {
          counter$.complete();
        }
      );
    },
    preview: (tick: number): void => {
      const { counter$, constant$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      constant$.subscribe((a) => {
        console.log('constant', a);
      });

      counter$.start();
    },
  },
];
