import { Observable } from '../../src/abstract_class';
import { merge } from '../../src/combine';
import { interval, IntervalObservable } from '../../src/create';
import { filter } from '../../src/operators';
import { auditTime } from '../../src/operators/audit-time';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23
  filtered      1       3   4                       10          13          16  17  18  19  20
  auditTime               3           4                       10          13          18          20
*/
const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  filtered$: Observable<number>;
  auditTime$: Observable<number>;
  merged$: Observable<number>;
} => {
  const emitValues = [1, 3, 4, 10, 13, 16, 17, 18, 19, 20];
  const counter$ = interval(tick);
  const filtered$ = counter$.pipe(filter((n) => emitValues.includes(n)));
  const auditTime$ = filtered$.pipe(auditTime(tick * 2.5));
  const merged$ = merge(filtered$, auditTime$);
  return {
    counter$,
    filtered$,
    auditTime$,
    merged$,
  };
};

export const auditTimeTestCases: StreamTestCase<number>[] = [
  {
    name: 'auditTime case 1',
    numTakeDefault: 6,
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, auditTime$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        auditTime$,
        take,
        () => {
          counter$.start();
        },
        () => {
          counter$.stop();
        }
      );
    },
    preview: (tick: number): void => {
      const { counter$, filtered$, auditTime$ } = createStreams(tick);

      filtered$.subscribe((a) => console.log('filtered', a));
      auditTime$.subscribe((a) => console.log('auditTime', a));

      counter$.start();
    },
  },
  {
    name: 'auditTime case 2',
    numTakeDefault: 16,
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, merged$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        merged$,
        take,
        () => {
          counter$.start();
        },
        () => {
          counter$.stop();
        }
      );
    },
    preview: (tick: number): void => {
      const { counter$, filtered$, auditTime$, merged$ } = createStreams(tick);

      filtered$.subscribe((a) => console.log('filtered', a));
      auditTime$.subscribe((a) => console.log('auditTime', a));
      merged$.subscribe((a) =>
        console.log('merged', a, filtered$.isUpdated, auditTime$.isUpdated)
      );

      counter$.start();
    },
  },
];
