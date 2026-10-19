import { createState } from 'synstate';
import { constant, render, view, type JSX } from 'synstate-dom';

const [count$, _setCount, { updateState: updateCount }] = createState(0);

// Called once. Only the text node bound to `count$` changes afterwards.
const Counter = (): JSX.Element => (
  <div>
    <p>{view(count$, (n) => `Count: ${n}`)}</p>
    <button
      type={constant('button')}
      onClick={() => {
        updateCount((n) => n + 1);
      }}
    >
      {constant('+1')}
    </button>
  </div>
);

const unmount = render(Counter, document.body);

// Later: disposes every subscription the app made and removes its nodes.
unmount();
