import { createState, map } from 'synstate';
import { render, type JSX } from 'synstate-dom';
import type { CounterFramework } from './counter.mjs';

export const synstateDomCounter: CounterFramework = {
  name: 'synstate-dom',
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
