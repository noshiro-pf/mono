import { batch, effect, signal, type Signal } from '@preact/signals-core';
import { Arr } from 'ts-data-forge';
import type { Point, SpringAdapter } from '../../spring-demo/index.mjs';
import { CANVAS_HEIGHT, CANVAS_WIDTH, SPRING_FACTOR, lerp } from './shared.mjs';

export const createPreactSignalsThroughputAdapter = (): SpringAdapter => {
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
      // does. `peek` reads a stage without subscribing the effect to it.
      mut_disposers.push(
        effect(() => {
          let mut_prev: Point = head.value;

          batch(() => {
            for (const mut_stage of stages) {
              const next = lerp(mut_stage.peek(), mut_prev, SPRING_FACTOR);

              mut_stage.value = next;

              mut_prev = next;
            }
          });
        }),
      );

      // Emit all points.
      // eslint-disable-next-line unicorn/prefer-single-call
      mut_disposers.push(
        effect(() => {
          onEmit(
            Arr.toUnshifted(head.value)(stages.map((stage) => stage.value)),
          );
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
