import { NumericInput } from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant, render } from 'synstate-dom';

// The value is a number; what the user is typing stays text until committed.
const [rate$, setRate] = createState(1.5);

// The bounds a committed number is clamped to before `normalize`, which are
// also read out as the spin button's.
const minRate = 0;

const maxRate = 20;

const unmount = render(
  () => (
    <NumericInput
      // `NaN` for text that is not a number, which `normalize` replaces.
      decode={Number.parseFloat}
      encode={(rate) => rate.toFixed(2)}
      max={constant(maxRate)}
      min={constant(minRate)}
      // Given a number already in the bounds, which are on its 0.01 grid, or
      // `NaN`.
      normalize={(rate) =>
        Number.isNaN(rate) ? minRate : Math.round(rate * 100) / 100
      }
      step={0.05}
      value={rate$}
      onValueChange={setRate}
    />
  ),
  document.body,
);

unmount();
