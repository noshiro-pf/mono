import { combineLatest } from '../../src/combine';
import { interval } from '../../src/create';
import { debounceTime, filter } from '../../src/operators';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20
  even      0       2       4       6       8       10      12      14      16      18      20
  filtered  0   1   2   3   4                       10  11  12  13  14
  debounced                             4                                       14
  combined                              x   x       x       x       x       x   x   x       x
*/

const createStreams = (tick: number) => {
  const counter$ = interval(tick);
  const even$ = counter$.pipe(filter((n) => n % 2 === 0));
  const filtered$ = counter$.pipe(filter((n) => n % 10 < 5));
  const debounced$ = filtered$.pipe(debounceTime(tick * 3));
  const combined$ = combineLatest(even$, debounced$);
  return {
    counter$,
    even$,
    filtered$,
    debounced$,
    combined$,
  };
};

export const debounceTimeTestCases: StreamTestCase<[number, number]>[] = [
  {
    name: 'debounceTime case 1',
    numTakeDefault: 20,
    run: (take: number, tick: number): Promise<[number, number][]> => {
      const { counter$, combined$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        combined$,
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
      const {
        counter$,
        even$,
        filtered$,
        debounced$,
        combined$,
      } = createStreams(tick);

      console.log(
        counter$.id,
        counter$.descendantsIds,
        counter$.children.map((a) => a.id),
        even$.id,
        even$.descendantsIds,
        even$.children.map((a) => a.id),
        filtered$.id,
        filtered$.descendantsIds,
        filtered$.children.map((a) => a.id),
        debounced$.id,
        debounced$.descendantsIds,
        debounced$.children.map((a) => a.id),
        combined$.id,
        combined$.descendantsIds,
        combined$.children.map((a) => a.id)
      );

      even$.subscribe((a) => console.log('even', a));
      filtered$.subscribe((a) => console.log('filtered', a));
      debounced$.subscribe((a) => console.log('debounced', a));
      combined$.subscribe((a) => console.log('combined', a));

      counter$.start();
    },
  },
];
