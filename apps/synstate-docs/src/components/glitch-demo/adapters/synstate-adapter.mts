import { combine, map, source } from 'synstate';
import { type Adapter, type Point, type Subscription } from '../types.mjs';

export const createSynStateAdapter = (): Adapter => {
  let mut_mousePos: ReturnType<typeof source<Point>> | undefined;

  let mut_subscription: Subscription | undefined;

  return {
    name: 'SynState',
    setup: ({ onEmit }) => {
      mut_mousePos = source<Point>({ x: -1, y: -1 });

      const derivedX = mut_mousePos.pipe(map((pos) => pos.x));

      const derivedY = mut_mousePos.pipe(map((pos) => pos.y));

      const combined = combine([derivedX, derivedY]).pipe(
        map(([x, y]) => ({ x, y })),
      );

      mut_subscription = combined.subscribe(onEmit);
    },
    onMouseMove: (pos) => {
      mut_mousePos?.next(pos);
    },
    cleanup: () => {
      mut_subscription?.unsubscribe();

      mut_subscription = undefined;

      mut_mousePos = undefined;
    },
  };
};
