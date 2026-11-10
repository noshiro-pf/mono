import {
  createState,
  derive,
  scan,
  type InitializedObservable,
  type Unsubscribe,
} from 'synstate-next';
import { Arr, asSafeUint, range, type SafeUint } from 'ts-data-forge';

// embed-sample-code-ignore-above
type Point = Readonly<{ x: number; y: number }>;

/**
 * The deep chain: a head point followed by `chainDepth` stages, each moving a
 * small step towards the stage before it whenever the head moves. The
 * subscriber receives every point after each move.
 */
export const createSynStateNextThroughputAdapter = (): ThroughputAdapter => {
  let mut_setHead: ((pos: Point) => void) | undefined;

  let mut_unsubscribe: Unsubscribe | undefined;

  return {
    name: 'synstate-next',
    setup: (chainDepth, { onEmit }) => {
      const startPos: Point = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
      } as const;

      const [head, setHead] = createState(startPos);

      mut_setHead = setHead;

      const mut_stages: InitializedObservable<Point>[] = [];

      let mut_prev: InitializedObservable<Point> = head;

      for (const _ of range(0, chainDepth)) {
        const stage = mut_prev.pipe(
          scan(
            (acc: Point, target: Point) =>
              stepTowards(acc, target, SPRING_FACTOR),
            startPos,
          ),
        );

        mut_stages.push(stage);

        mut_prev = stage;
      }

      mut_unsubscribe = derive(
        Arr.toUnshifted(head)(mut_stages),
        (...points) => points,
      ).subscribe(onEmit);
    },
    onMouseMove: (pos) => {
      mut_setHead?.(pos);
    },
    cleanup: () => {
      mut_unsubscribe?.();

      mut_unsubscribe = undefined;

      mut_setHead = undefined;
    },
  };
};

/** The shape of the adapters the deep chain runner drives. */
export type ThroughputAdapter = Readonly<{
  name: string;
  setup: (
    chainDepth: SafeUint,
    callbacks: Readonly<{ onEmit: (points: readonly Point[]) => void }>,
  ) => void;
  onMouseMove: (pos: Point) => void;
  cleanup: () => void;
}>;

// The canvas and spring of synstate's throughput demo, whose adapters for the
// other libraries are timed beside this one.
const CANVAS_WIDTH = 500;

const CANVAS_HEIGHT = 400;

const SPRING_FACTOR = 0.003;

const stepTowards = (current: Point, target: Point, factor: number): Point =>
  ({
    x: current.x + (target.x - current.x) * factor,
    y: current.y + (target.y - current.y) * factor,
  }) as const;
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('deep-chain benchmark (synstate-next)', () => {
    const adapter = createSynStateNextThroughputAdapter();

    let mut_emissions = 0;

    let mut_last: readonly Point[] = [];

    adapter.setup(asSafeUint(2), {
      onEmit: (points) => {
        mut_emissions += 1;

        mut_last = points;
      },
    });

    adapter.onMouseMove({ x: 0, y: 0 });

    adapter.cleanup();

    // Once on subscribing, once for the move.
    assert.strictEqual(mut_emissions, 2);

    const first = stepTowards(
      { x: 250, y: 200 },
      { x: 0, y: 0 },
      SPRING_FACTOR,
    );

    assert.deepStrictEqual(mut_last, [
      { x: 0, y: 0 },
      first,
      stepTowards({ x: 250, y: 200 }, first, SPRING_FACTOR),
    ]);
  });
}
