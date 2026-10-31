import { Arr, range } from 'ts-data-forge';
// The deep chain benchmark loads this module in Node too (through
// `spring-demo/index.mts`), where bare `solid-js` is the server build;
// `solid-js-client.mts` says why it imports the client build instead.
/* eslint-disable import-x/no-internal-modules -- one shim for both demos, which their barrels do not export */
import {
  type Accessor,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
} from '../../throughput-demo/adapters/solid-js-client.mjs';
/* eslint-enable import-x/no-internal-modules */
import type { Point, SpringAdapter } from '../types.mjs';
import { CANVAS_HEIGHT, CANVAS_WIDTH, LERP_FACTOR, lerp } from './shared.mjs';

export const createSolidSpringAdapter = (): SpringAdapter => {
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
            (prevSelf: Point) => lerp(prevSelf, upstream(), LERP_FACTOR),
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
