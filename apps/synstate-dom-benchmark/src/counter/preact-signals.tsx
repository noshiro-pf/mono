/** @jsxImportSource preact */
import { signal } from '@preact/signals';
import { render } from 'preact';
import type { CounterFramework } from './counter.mjs';

export const preactSignalsCounter: CounterFramework = {
  name: 'Preact + Signals',
  mount: (container) => {
    const mut_count = signal(0);

    render(
      <button
        onClick={() => {
          mut_count.value += 1;
        }}
      >
        {mut_count}
      </button>,
      container,
    );

    return () => {
      render(null, container);
    };
  },
} as const;
