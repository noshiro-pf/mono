/** @jsxImportSource react */
import { useMemo, useState, type JSX } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { ScenarioFramework } from '../scenario.mjs';
import { createLoanOperations } from './loan-operations.mjs';
import {
  computeLoan,
  initialInputs,
  type LoanApp,
  type LoanInputs,
} from './model.mjs';

/**
 * The inputs are one state, and the render computes every figure from them in
 * a loop, in a `useMemo`; there is no graph to propagate through. Each change
 * is rendered with `flushSync`, as a click handler's update is.
 */
export const reactLoan: ScenarioFramework<LoanApp> = {
  name: 'React',
  mount: (container) => {
    const root = createRoot(container);

    const mut_view: { setInputs: ((inputs: LoanInputs) => void) | undefined } =
      { setInputs: undefined };

    const App = (): JSX.Element => {
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

    flushSync(() => {
      root.render(<App />);
    });

    return createLoanOperations(
      (inputs) => {
        flushSync(() => {
          mut_view.setInputs?.(inputs);
        });
      },
      () => {
        root.unmount();
      },
    );
  },
} as const;
