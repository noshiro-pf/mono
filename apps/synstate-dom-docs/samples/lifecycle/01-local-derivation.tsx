import { createState, map } from 'synstate';
import { type JSX, view } from 'synstate-dom';
import { Arr } from 'ts-data-forge';

// The store: module level, so it belongs to no scope and lives as long as the
// page.
export const [cart$, setCart] = createState<readonly number[]>([]);

export const CartTotal = (): JSX.Element => {
  // Only this view reads the total, so it is created here. It belongs to the
  // scope this component is mounted in and is disposed with it.
  const total$ = cart$.pipe(map(Arr.sum));

  return <p>{view(total$, (t) => `Total: ${t}`)}</p>;
};
