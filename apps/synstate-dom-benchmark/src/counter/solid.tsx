/** @jsxImportSource solid-js */
import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import type { CounterFramework } from './counter.mjs';

export const solidCounter: CounterFramework = {
  name: 'Solid',
  mount: (container) =>
    render(() => {
      const [count, setCount] = createSignal(0);

      return (
        <button
          onClick={() => {
            setCount((n) => n + 1);
          }}
        >
          {count()}
        </button>
      );
    }, container),
} as const;
