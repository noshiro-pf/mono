import { createState, map } from 'synstate';
import { constant, For, type JSX } from 'synstate-dom';

const [count$, setCount] = createState(0);

export const Counter = (): JSX.Element => (
  <div>
    {/* A `map` node, created in the component: it lives while it is mounted. */}
    <p>{count$.pipe(map((n) => `${n} items`))}</p>
    <button
      type={constant('button')}
      disabled={count$.pipe(map((n) => n === 0))}
      onClick={() => {
        setCount(0);
      }}
    >
      {constant('Reset')}
    </button>
  </div>
);

type Item = Readonly<{ id: number; price: number }>;

const [items$] = createState<readonly Item[]>([
  { id: 1, price: 120 },
  { id: 2, price: 80 },
]);

export const PriceList = (): JSX.Element => (
  <ul>
    <For items={items$} key={(item) => item.id}>
      {/* One `map` node per row, disposed with the row. */}
      {(item$) => <li>{item$.pipe(map((item) => `${item.price} yen`))}</li>}
    </For>
  </ul>
);
