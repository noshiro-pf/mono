import { Observable } from '../../src/abstract_class';
import { combineLatest } from '../../src/combine';
import { interval, IntervalObservable } from '../../src/create';
import { filter, map } from '../../src/operators';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

/*
 *  [      counter      ]
 *    |           |
 *    |           |
 * [double]    [square]
 *    |  \        |  \
 *    | [quad]    | [squareEven]
 *    |     |     |     |
 *    |     |     |     |
 *  [      combined       ]
 */

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  double$: Observable<number>;
  quad$: Observable<number>;
  square$: Observable<number>;
  squareEven$: Observable<number>;
  combined$: Observable<[number, number, number, number, number]>;
} => {
  const counter$ = interval(tick);

  const double$ = counter$.pipe(map((x) => x * 2));
  const quad$ = counter$.pipe(
    map((x) => x * 2),
    map((x) => x * 2)
  );
  const square$ = counter$.pipe(map((x) => x * x));
  const squareEven$ = square$.pipe(filter((x) => x % 2 === 0));
  const combined$ = combineLatest(
    counter$,
    double$,
    quad$,
    square$,
    squareEven$
  );

  return {
    counter$,
    double$,
    quad$,
    square$,
    squareEven$,
    combined$,
  };
};

export const combineLatestTestCases: StreamTestCase<
  [number, number, number, number, number]
>[] = [
  {
    name: 'combineLatest case 1',
    numTakeDefault: 10,
    run: (
      take: number,
      tick: number
    ): Promise<[number, number, number, number, number][]> => {
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
        double$,
        quad$,
        square$,
        squareEven$,
        combined$,
      } = createStreams(tick);

      counter$.subscribe((a) => console.log('counter', a));
      double$.subscribe((a) => console.log('double', a));
      quad$.subscribe((a) => console.log('quad', a));
      square$.subscribe((a) => console.log('square', a));
      squareEven$.subscribe((a) => console.log('squareEven', a));
      combined$.subscribe((a) => console.log('combined', a));

      console.log(
        counter$.id,
        counter$.descendantsIds,
        counter$.children.map((a) => a.id),
        double$.id,
        double$.descendantsIds,
        double$.children.map((a) => a.id),
        quad$.id,
        quad$.descendantsIds,
        quad$.children.map((a) => a.id),
        square$.id,
        square$.descendantsIds,
        square$.children.map((a) => a.id),
        squareEven$.id,
        squareEven$.descendantsIds,
        squareEven$.children.map((a) => a.id),
        combined$.id,
        combined$.descendantsIds,
        combined$.children.map((a) => a.id)
      );

      counter$.start();
    },
  },
];
