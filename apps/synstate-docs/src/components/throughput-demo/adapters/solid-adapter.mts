import { Arr, range } from 'ts-data-forge';
import type { Point, SpringAdapter } from '../../spring-demo/index.mjs';
import { CANVAS_HEIGHT, CANVAS_WIDTH, SPRING_FACTOR, lerp } from './shared.mjs';
import {
  type Accessor,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
} from './solid-js-client.mjs';

export const createSolidThroughputAdapter = (): SpringAdapter => {
  let mut_setHead: ((pos: Point) => void) | undefined;

  let mut_dispose: (() => void) | undefined;

  return {
    name: 'Solid',
    setup: (chainDepth, { onEmit }) => {
      const startPos: Point = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
      } as const;

      createRoot((dispose) => {
        mut_dispose = dispose;

        const [head, setHead] = createSignal<Point>(startPos);

        mut_setHead = setHead;

        const mut_stages: Accessor<Point>[] = [];

        let mut_prev: Accessor<Point> = head;

        for (const _ of range(0, chainDepth)) {
          const upstream = mut_prev;

          // A memo is given its own previous value, which is `scan`'s
          // accumulator.
          const stage = createMemo(
            (prevSelf: Point) => lerp(prevSelf, upstream(), SPRING_FACTOR),
            startPos,
          );

          mut_stages.push(stage);

          mut_prev = stage;
        }

        createEffect(() => {
          onEmit(Arr.toUnshifted(head())(mut_stages.map((stage) => stage())));
        });
      });
    },
    onMouseMove: (pos) => {
      mut_setHead?.(pos);
    },
    cleanup: () => {
      mut_dispose?.();

      mut_dispose = undefined;

      mut_setHead = undefined;
    },
  };
};
