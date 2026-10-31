import { computed, effect, signal, type Signal } from '@preact/signals-core';
import type { Adapter, Point } from '../types.mjs';

export const createPreactSignalsAdapter = (): Adapter => {
  let mut_mousePos: Signal<Point> | undefined;

  let mut_dispose: (() => void) | undefined;

  return {
    name: 'Preact Signals',
    setup: ({ onEmit }) => {
      const mousePos = signal<Point>({ x: -1, y: -1 });

      mut_mousePos = mousePos;

      const derivedX = computed(() => mousePos.value.x);

      const derivedY = computed(() => mousePos.value.y);

      const combinedPos = computed((): Point => ({
        x: derivedX.value,
        y: derivedY.value,
      }));

      mut_dispose = effect(() => {
        onEmit(combinedPos.value);
      });
    },
    onMouseMove: (pos) => {
      if (mut_mousePos !== undefined) {
        mut_mousePos.value = pos;
      }
    },
    cleanup: () => {
      mut_dispose?.();

      mut_dispose = undefined;

      mut_mousePos = undefined;
    },
  };
};
