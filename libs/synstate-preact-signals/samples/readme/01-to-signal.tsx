/* eslint-disable arrow-body-style */
/* eslint-disable prefer-arrow-functions/prefer-arrow-functions */
// embed-sample-code-ignore-above

import type * as Preact from 'preact';
import { createState } from 'synstate';
import { toSignal } from 'synstate-preact-signals';

const [count$, setCount] = createState(0);

const countSignal = toSignal<number>(count$);

const Counter = (): Preact.JSX.Element => {
  // No hooks needed — only this text node updates, not the whole component
  return (
    <div>
      <span>{countSignal}</span>
      <button
        onClick={() => {
          setCount(countSignal.value + 1);
        }}
      >
        {'+1'}
      </button>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(Counter);
