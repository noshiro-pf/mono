import {
  combine,
  map,
  scan,
  source,
  type Observable,
  type WithInitialValueOperator,
} from 'synstate';
import { Arr, range } from 'ts-data-forge';
import {
  type Point,
  type SpringAdapter,
  type Subscription,
} from '../../spring-demo/index.mjs';
import { CANVAS_HEIGHT, CANVAS_WIDTH, SPRING_FACTOR, lerp } from './shared.mjs';

const springOperator = (
  startPos: Point,
): WithInitialValueOperator<Point, Point> =>
  scan(
    (acc: Point, target: Point) => lerp(acc, target, SPRING_FACTOR),
    startPos,
  );

export const createSynStateThroughputAdapter = (): SpringAdapter => {
  let mut_mousePos: ReturnType<typeof source<Point>> | undefined;

  let mut_subscription: Subscription | undefined;

  return {
    name: 'SynState',
    setup: (chainDepth, { onEmit }) => {
      const startPos: Point = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
      } as const;

      mut_mousePos = source<Point>(startPos);

      const head = mut_mousePos;

      const mut_stages: Observable<Point>[] = [];

      let mut_prev: Observable<Point> = head;

      for (const _ of range(0, chainDepth)) {
        const stage: Observable<Point> = mut_prev.pipe(
          springOperator(startPos),
        );

        mut_stages.push(stage);

        mut_prev = stage;
      }

      if (Arr.isArrayOfLength(mut_stages, 0)) {
        mut_subscription = head.pipe(map((pos) => [pos])).subscribe(onEmit);
      } else {
        const allPoints = combine([head, ...mut_stages] as const).pipe(
          map((points) => points),
        );

        mut_subscription = allPoints.subscribe(onEmit);
      }
    },
    onMouseMove: (pos) => {
      mut_mousePos?.next(pos);
    },
    cleanup: () => {
      mut_subscription?.unsubscribe();

      mut_subscription = undefined;

      mut_mousePos?.complete();

      mut_mousePos = undefined;
    },
  };
};
