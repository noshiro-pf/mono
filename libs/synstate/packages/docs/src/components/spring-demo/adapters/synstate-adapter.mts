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
} from '../types.mjs';
import { CANVAS_HEIGHT, CANVAS_WIDTH, LERP_FACTOR, lerp } from './shared.mjs';

const springOperator = (
  startPos: Point,
): WithInitialValueOperator<Point, Point> =>
  scan((acc: Point, target: Point) => lerp(acc, target, LERP_FACTOR), startPos);

export const createSynStateSpringAdapter = (): SpringAdapter => {
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

      // Build deep scan chain: each stage follows the previous
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

      if (Arr.isEmpty(mut_stages)) {
        // No chain depth — just emit the head
        mut_subscription = head.pipe(map((pos) => [pos])).subscribe(onEmit);
      } else {
        // Combine head + all stages into a single Point[]
        // `as const` needs a literal, and `combine` needs the tuple type only
        // the literal produces.
        // eslint-disable-next-line ts-data-forge/prefer-canonical-array-slicing
        const allPoints = combine([head, ...mut_stages]).pipe(
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
