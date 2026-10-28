/** @jsxImportSource react */
import { useState, type JSX } from 'react';
import { createRoot } from 'react-dom/client';
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

export const reactCounter: CounterFramework = {
  name: 'React',
  mount: (container) => {
    const root = createRoot(container);

    root.render(<Counter />);

    return () => {
      root.unmount();
    };
  },
} as const;
