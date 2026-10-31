import { NumericInput } from 'blueprint-synstate';
import { createState } from 'synstate';
import { render } from 'synstate-dom';

// The value is a number; what the user is typing stays text until committed.
const [rate$, setRate] = createState(1.5);

const unmount = render(
  () => (
    <NumericInput
      // `NaN` for text that is not a number, which `normalize` replaces.
      decode={Number.parseFloat}
      encode={(rate) => rate.toFixed(2)}
      normalize={(rate) =>
        Number.isFinite(rate)
          ? Math.min(20, Math.max(0, Math.round(rate * 100) / 100))
          : 0
      }
      step={0.05}
      value={rate$}
      onValueChange={setRate}
    />
  ),
  document.body,
);

unmount();
