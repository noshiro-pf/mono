import { counter, createBooleanState, withInitialValue } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';

export const StopwatchDemo = (): JSX.Element => {
  const [shown$, { toggle }] = createBooleanState(true);

  return (
    <section>
      <h2>{constant('Stopwatch')}</h2>
      <p>
        {constant(
          'The timer is created inside the branch. Hiding it disposes the branch, which stops the timer; showing it again starts a new one from zero.',
        )}
      </p>
      <button
        type={constant('button')}
        data-e2e={constant('stopwatch-toggle')}
        onClick={() => {
          toggle();
        }}
      >
        {view(shown$, (shown) => (shown ? 'Hide' : 'Show'))}
      </button>
      <If cond={shown$} then={<Stopwatch />} />
    </section>
  );
};

const Stopwatch = (): JSX.Element => {
  // Belongs to the `If` branch's scope: its interval is cleared when the branch
  // is disposed.
  const tenths$ = counter(100, { emitInitial: false }).pipe(
    withInitialValue(0),
  );

  return (
    <p data-e2e={constant('stopwatch')}>
      {view(tenths$, (n) => `${(n / 10).toFixed(1)} s`)}
    </p>
  );
};
