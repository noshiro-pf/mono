import type { JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';
import { Arr } from 'ts-data-forge';

// The store: module level, so it belongs to no owner and lives as long as the
// page.
export const [cart$, setCart] = createState<readonly number[]>([]);

export const CartTotal = (): JSX.Element => {
  // Only this view reads the total, so it is created here. It belongs to the
  // owner this component is mounted in and is disposed with it.
  const total$ = cart$.pipe(map(Arr.sum));

  return <p>{total$.pipe(map((t) => `Total: ${t}`))}</p>;
};
