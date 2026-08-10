import { BehaviorSubject, combineLatest, map, type Subscription } from 'rxjs';
import { type Adapter, type Point } from '../types.mjs';

export const createRxJSAdapter = (): Adapter => {
  let mut_mousePos$: BehaviorSubject<Point> | undefined;

  let mut_subscription: Subscription | undefined;

  return {
    name: 'RxJS',
    setup: ({ onEmit }) => {
      mut_mousePos$ = new BehaviorSubject<Point>({ x: -1, y: -1 });

      const derivedX$ = mut_mousePos$.pipe(map((pos) => pos.x));

      const derivedY$ = mut_mousePos$.pipe(map((pos) => pos.y));

      const combined$ = combineLatest([derivedX$, derivedY$]).pipe(
        map(([x, y]) => ({ x, y })),
      );

      mut_subscription = combined$.subscribe(onEmit);
    },
    onMouseMove: (pos) => {
      mut_mousePos$?.next(pos);
    },
    cleanup: () => {
      mut_subscription?.unsubscribe();

      mut_subscription = undefined;

      mut_mousePos$?.complete();

      mut_mousePos$ = undefined;
    },
  };
};
