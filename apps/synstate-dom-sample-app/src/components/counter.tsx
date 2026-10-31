import { createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

// Called once. Only the text node and the `disabled` attribute bound to
// `count$` change afterwards.
export const Counter = (): JSX.Element => {
  // State created inside a component belongs to the scope it is mounted in and
  // is disposed with it.
  const [count$, , { updateState: updateCount, resetState: resetCount }] =
    createState(0);

  return (
    <section>
      <h2>{constant('Counter')}</h2>
      <p data-e2e={constant('count')}>{view(count$, (n) => `Count: ${n}`)}</p>
      <button
        type={constant('button')}
        data-e2e={constant('decrement')}
        disabled={view(count$, (n) => n <= 0)}
        onClick={() => {
          updateCount((n) => n - 1);
        }}
      >
        {constant('-1')}
      </button>
      <button
        type={constant('button')}
        data-e2e={constant('increment')}
        onClick={() => {
          updateCount((n) => n + 1);
        }}
      >
        {constant('+1')}
      </button>
      <button
        type={constant('button')}
        onClick={() => {
          resetCount();
        }}
      >
        {constant('Reset')}
      </button>
    </section>
  );
};
