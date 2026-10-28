/** @jsxImportSource preact */
import { render, type JSX } from 'preact';
import { useState } from 'preact/hooks';
import type { CounterFramework } from './counter.mjs';

const Counter = (): JSX.Element => {
  const [count, setCount] = useState(0);

  return (
    <button
      onClick={() => {
        setCount((n) => n + 1);
      }}
    >
      {count}
    </button>
  );
};

export const preactCounter: CounterFramework = {
  name: 'Preact',
  mount: (container) => {
    render(<Counter />, container);

    return () => {
      render(null, container);
    };
  },
} as const;
