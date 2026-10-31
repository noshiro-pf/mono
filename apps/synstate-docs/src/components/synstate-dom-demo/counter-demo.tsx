/** @jsxImportSource synstate-dom */
// embed-sample-code-ignore-above
import { createBooleanState, createState, map } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';

const [count$, , { updateState: updateCount, resetState: resetCount }] =
  createState(0);

// A derived value is an Observable like any other, bound where it is shown.
const doubled$ = count$.pipe(map((n) => n * 2));

const [isVisible$, { toggle: toggleVisibility }] = createBooleanState(true);

// How many times `CounterDemo` itself has been called.
const mut_componentCalls = { count: 0 };

export const CounterDemo = (): JSX.Element => {
  mut_componentCalls.count += 1;

  return (
    <div>
      <div class={constant('row')}>
        <span class={constant('label')}>{constant('Count:')}</span>
        <span class={constant('value')}>{count$}</span>
      </div>
      <div class={constant('row')}>
        <span class={constant('label')}>{constant('Doubled (map):')}</span>
        <span class={constant('value')}>{doubled$}</span>
      </div>
      <div class={constant('row')}>
        <span class={constant('label')}>{constant('Component calls:')}</span>
        <span class={constant('value')}>
          {constant(mut_componentCalls.count)}
        </span>
      </div>
      <If
        cond={isVisible$}
        then={
          <div class={constant('box')}>
            {constant('Mounted by If while isVisible$ is true.')}
          </div>
        }
      />
      <div class={constant('controls')}>
        <button type={constant('button')} onClick={decrement}>
          {constant('-1')}
        </button>
        <button type={constant('button')} onClick={increment}>
          {constant('+1')}
        </button>
        <button type={constant('button')} onClick={resetCount}>
          {constant('Reset')}
        </button>
        <button type={constant('button')} onClick={toggleVisibility}>
          {constant('Toggle visibility')}
        </button>
      </div>
    </div>
  );
};

const decrement = (): void => {
  updateCount((n) => n - 1);
};

const increment = (): void => {
  updateCount((n) => n + 1);
};
