/** @jsxImportSource preact */
import { render } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import type { ScenarioFramework } from '../scenario.mjs';
import { createLoanOperations } from './loan-operations.mjs';
import {
  computeLoan,
  initialInputs,
  type LoanApp,
  type LoanInputs,
} from './model.mjs';

/**
 * Preact without Signals, written as the React implementation is: the inputs
 * are one state, and the render computes every figure in a `useMemo`. Preact
 * renders a state change in a microtask, which the harness waits for.
 */
export const preactLoan: ScenarioFramework<LoanApp> = {
  name: 'Preact',
  mount: (container) => {
    const mut_view: { setInputs: ((inputs: LoanInputs) => void) | undefined } =
      { setInputs: undefined };

    const App = (): preact.JSX.Element => {
      const [inputs, setInputs] = useState(initialInputs);

      // The setter is stable; the operations below call it from outside.
      mut_view.setInputs = setInputs;

      const rows = useMemo(() => computeLoan(inputs), [inputs]);

      return (
        <table>
          <tbody>
            {rows.map((cells, i) => (
              <tr key={i}>
                {cells.map((text, j) => (
                  <td key={j}>{text}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    };

    render(<App />, container);

    return createLoanOperations(
      (inputs) => {
        mut_view.setInputs?.(inputs);
      },
      () => {
        render(null, container);
      },
    );
  },
} as const;
