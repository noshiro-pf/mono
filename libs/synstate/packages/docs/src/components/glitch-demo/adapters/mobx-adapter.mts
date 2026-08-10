import { computed, observable, reaction, runInAction } from 'mobx';
import { type Adapter, type Point } from '../types.mjs';

export const createMobXAdapter = (): Adapter => {
  let mut_mousePos: undefined | { x: number; y: number };

  let mut_dispose: (() => void) | undefined;

  return {
    name: 'MobX',
    setup: ({ onEmit }) => {
      mut_mousePos = observable({ x: -1, y: -1 });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const derivedX = computed(() => mut_mousePos!.x);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const derivedY = computed(() => mut_mousePos!.y);

      const combinedPos = computed((): Point => ({
        x: derivedX.get(),
        y: derivedY.get(),
      }));

      mut_dispose = reaction(
        () => combinedPos.get(),
        (pos) => {
          onEmit(pos);
        },
        { fireImmediately: true },
      );
    },
    onMouseMove: (pos) => {
      if (mut_mousePos === undefined) return;

      // Both mutations are batched in a single action — no intermediate state
      runInAction(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        mut_mousePos!.x = pos.x;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        mut_mousePos!.y = pos.y;
      });
    },
    cleanup: () => {
      mut_dispose?.();

      mut_dispose = undefined;

      mut_mousePos = undefined;
    },
  };
};
