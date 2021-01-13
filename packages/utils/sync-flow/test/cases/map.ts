import { interval } from '../../src/create';
import { map } from '../../src/operators';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

const createStreams = (tick: number) => {
  const counter$ = interval(tick);

  const double$ = counter$.pipe(map((x) => x * 2));
  const quad1$ = double$.pipe(map((x) => x * 2));
  const quad2$ = counter$.pipe(
    map((x) => x * 2),
    map((x) => x * 2)
  );

  return {
    counter$,
    double$,
    quad1$,
    quad2$,
  };
};

export const mapTestCases: StreamTestCase<number>[] = [
  {
    name: 'map case 1',
    numTakeDefault: 10,
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, double$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        double$,
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
      const { counter$, double$ } = createStreams(tick);

      counter$.subscribe((a) => console.log('counter', a));
      double$.subscribe((a) => console.log('double', a));

      console.log(
        counter$.id,
        counter$.descendantsIds,
        counter$.children.map((a) => a.id),
        double$.id,
        double$.descendantsIds,
        double$.children.map((a) => a.id)
      );

      counter$.start();
    },
  },
  {
    name: 'map case 2',
    numTakeDefault: 10,
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, quad1$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        quad1$,
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
      const { counter$, quad1$ } = createStreams(tick);

      counter$.subscribe((a) => console.log('counter', a));
      quad1$.subscribe((a) => console.log('quad1', a));

      console.log(
        counter$.id,
        counter$.descendantsIds,
        counter$.children.map((a) => a.id),
        quad1$.id,
        quad1$.descendantsIds,
        quad1$.children.map((a) => a.id)
      );

      counter$.start();
    },
  },
  {
    name: 'map case 3',
    numTakeDefault: 10,
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, quad1$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        quad1$,
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
      const { counter$, quad2$ } = createStreams(tick);

      counter$.subscribe((a) => console.log('counter', a));
      quad2$.subscribe((a) => console.log('quad2', a));

      console.log(
        counter$.id,
        counter$.descendantsIds,
        counter$.children.map((a) => a.id),
        quad2$.id,
        quad2$.descendantsIds,
        quad2$.children.map((a) => a.id)
      );

      counter$.start();
    },
  },
];
