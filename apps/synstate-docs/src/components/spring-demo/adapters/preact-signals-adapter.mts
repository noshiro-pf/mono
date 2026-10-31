import { batch, effect, signal, type Signal } from '@preact/signals-core';
import { Arr } from 'ts-data-forge';
import type { Point, SpringAdapter } from '../types.mjs';
import { CANVAS_HEIGHT, CANVAS_WIDTH, LERP_FACTOR, lerp } from './shared.mjs';

export const createPreactSignalsSpringAdapter = (): SpringAdapter => {
  let mut_head: Signal<Point> | undefined;

  // `let` + reassignment, for the reason the MobX adapter gives.
  let mut_disposers: (() => void)[] = [];

  return {
    name: 'Preact Signals',
    setup: (chainDepth, { onEmit }) => {
      const startPos: Point = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
      } as const;

      const head = signal(startPos);

      mut_head = head;

      const stages: readonly Signal<Point>[] = Array.from(
        { length: chainDepth },
        () => signal(startPos),
      );

      // A `computed` is not given its own previous value, so each stage's
      // position is a signal, and one effect advances the whole chain in a
      // single batch when the head moves, as the MobX adapter's `reaction`
      // does, then emits the points. `peek` reads a stage without
      // subscribing the effect to it, so the effect runs once per move.
      mut_disposers.push(
        effect(() => {
          const headPos = head.value;

          let mut_prev: Point = headPos;

          batch(() => {
            for (const mut_stage of stages) {
              const next = lerp(mut_stage.peek(), mut_prev, LERP_FACTOR);

              mut_stage.value = next;

              mut_prev = next;
            }
          });

          onEmit(Arr.toUnshifted(headPos)(stages.map((stage) => stage.peek())));
        }),
      );
    },
    onMouseMove: (pos) => {
      if (mut_head !== undefined) {
        mut_head.value = pos;
      }
    },
    cleanup: () => {
      for (const dispose of mut_disposers) {
        dispose();
      }

      mut_disposers = [];

      mut_head = undefined;
    },
  };
};
