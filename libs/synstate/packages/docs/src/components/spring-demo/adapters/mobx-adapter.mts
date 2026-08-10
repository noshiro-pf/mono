import {
  autorun,
  observable,
  reaction,
  runInAction,
  type IObservableValue,
} from 'mobx';
import { Arr } from 'ts-data-forge';
import { type Point, type SpringAdapter } from '../types.mjs';
import { CANVAS_HEIGHT, CANVAS_WIDTH, LERP_FACTOR, lerp } from './shared.mjs';

export const createMobXSpringAdapter = (): SpringAdapter => {
  let mut_head: IObservableValue<Point> | undefined;

  const mut_disposers: (() => void)[] = [];

  let mut_stages: IObservableValue<Point>[] = [];

  return {
    name: 'MobX',
    setup: (chainDepth, { onEmit }) => {
      const startPos: Point = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
      } as const;

      mut_head = observable.box(startPos);

      mut_stages = Array.from({ length: chainDepth }, () =>
        observable.box(startPos),
      );

      // When head changes, propagate through the entire chain in a single action.
      // Registered before the autorun so it runs first (MobX FIFO reaction order).
      mut_disposers.push(
        reaction(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          () => mut_head!.get(),
          () => {
            runInAction(() => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              let mut_prev: Point = mut_head!.get();

              for (const stage of mut_stages) {
                const next = lerp(stage.get(), mut_prev, LERP_FACTOR);

                stage.set(next);

                mut_prev = next;
              }
            });
          },
        ),
      );

      // Emit all points. Because autorun is registered after the chain reaction,
      // it always reads the fully-propagated state.
      // eslint-disable-next-line unicorn/prefer-single-call
      mut_disposers.push(
        autorun(() => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const head = mut_head!.get();

          onEmit(Arr.toUnshifted(head)(mut_stages.map((s) => s.get())));
        }),
      );
    },
    onMouseMove: (pos) => {
      mut_head?.set(pos);
    },
    cleanup: () => {
      for (const dispose of mut_disposers) {
        dispose();
      }

      mut_disposers.length = 0;

      mut_stages = [];

      mut_head = undefined;
    },
  };
};
