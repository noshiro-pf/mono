/** @jsxImportSource synstate-dom-next */
import { render, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';
import type { CounterFramework } from './counter.mjs';

export const synstateDomNextCounter: CounterFramework = {
  name: 'synstate-dom-next',
  mount: (container) => {
    const [count$, , { updateState }] = createState(0);

    const App = (): JSX.Element => (
      <button
        onClick={() => {
          updateState((n) => n + 1);
        }}
      >
        {count$.pipe(map(String))}
      </button>
    );

    return render(App, container);
  },
} as const;
