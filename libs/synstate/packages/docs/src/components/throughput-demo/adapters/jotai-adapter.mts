import { atom, createStore } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { range } from 'ts-data-forge';
import { type Point, type SpringAdapter } from '../../spring-demo/index.mjs';
import { CANVAS_HEIGHT, CANVAS_WIDTH, SPRING_FACTOR, lerp } from './shared.mjs';

// selectAtom's selector receives (currentValue, prevSlice?).
// prevSlice is the atom's own previous output — equivalent to scan's accumulator.
const springSelector = (target: Point, prevSelf?: Point): Point =>
  prevSelf === undefined ? target : lerp(prevSelf, target, SPRING_FACTOR);

export const createJotaiThroughputAdapter = (): SpringAdapter => {
  let mut_store: ReturnType<typeof createStore> | undefined;

  let mut_mousePosAtom: ReturnType<typeof atom<Point>> | undefined;

  let mut_unsubscribe: (() => void) | undefined;

  return {
    name: 'Jotai',
    setup: (chainDepth, { onEmit }) => {
      const startPos: Point = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
      } as const;

      mut_store = createStore();

      mut_mousePosAtom = atom<Point>(startPos);

      const mut_stageAtoms: ReturnType<typeof selectAtom<Point, Point>>[] = [];

      let mut_prevAtom:
        | ReturnType<typeof selectAtom<Point, Point>>
        | ReturnType<typeof atom<Point>> = mut_mousePosAtom;

      for (const _ of range(0, chainDepth)) {
        const prevAtom = mut_prevAtom;

        const stageAtom = selectAtom<Point, Point>(
          prevAtom,
          springSelector,
          // Never skip: always propagate since we create new Point objects
          () => false,
        );

        mut_stageAtoms.push(stageAtom);

        mut_prevAtom = stageAtom;
      }

      // Derived atom that reads head + all stages
      const allPointsAtom = atom((get) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const head = get(mut_mousePosAtom!);

        return [head, ...mut_stageAtoms.map((a) => get(a))];
      });

      // Initial read to establish subscription
      mut_store.get(allPointsAtom);

      mut_unsubscribe = mut_store.sub(allPointsAtom, () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onEmit(mut_store!.get(allPointsAtom));
      });
    },
    onMouseMove: (pos) => {
      if (mut_store === undefined || mut_mousePosAtom === undefined) {
        return;
      }

      mut_store.set(mut_mousePosAtom, pos);
    },
    cleanup: () => {
      mut_unsubscribe?.();

      mut_unsubscribe = undefined;

      mut_store = undefined;

      mut_mousePosAtom = undefined;
    },
  };
};
