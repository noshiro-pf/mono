/* eslint-disable @typescript-eslint/strict-void-return */
// embed-sample-code-ignore-above
import type * as Preact from 'preact';
import { createState } from 'synstate-preact-signals';

const [countSignal, setCount, { updateState, resetState }] = createState(0);

const Counter = (): Preact.JSX.Element => (
  <div>
    <span>{countSignal}</span>
    <button
      onClick={() => {
        updateState((n) => n + 1);
      }}
    >
      {'+1'}
    </button>
    <button onClick={resetState}>{'Reset'}</button>
  </div>
);

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(Counter, setCount);
