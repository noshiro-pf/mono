import { createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [count$, setCount] = createState(0);

export const Counter = (): JSX.Element => (
  <div>
    {/* `view` transforms in the subscriber: no node joins the graph. */}
    <p>{view(count$, (n) => `${n} items`)}</p>
    <button
      type={constant('button')}
      disabled={view(count$, (n) => n === 0)}
      onClick={() => {
        setCount(0);
      }}
    >
      {constant('Reset')}
    </button>
  </div>
);
