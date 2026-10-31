import { createEffect, createMemo, createRoot, createSignal } from 'solid-js';
import type { Adapter, Point } from '../types.mjs';

export const createSolidAdapter = (): Adapter => {
  let mut_setMousePos: ((pos: Point) => void) | undefined;

  let mut_dispose: (() => void) | undefined;

  return {
    name: 'Solid',
    setup: ({ onEmit }) => {
      createRoot((dispose) => {
        mut_dispose = dispose;

        const [mousePos, setMousePos] = createSignal<Point>({ x: -1, y: -1 });

        mut_setMousePos = setMousePos;

        const derivedX = createMemo(() => mousePos().x);

        const derivedY = createMemo(() => mousePos().y);

        const combinedPos = createMemo((): Point => ({
          x: derivedX(),
          y: derivedY(),
        }));

        createEffect(() => {
          onEmit(combinedPos());
        });
      });
    },
    onMouseMove: (pos) => {
      mut_setMousePos?.(pos);
    },
    cleanup: () => {
      mut_dispose?.();

      mut_dispose = undefined;

      mut_setMousePos = undefined;
    },
  };
};
