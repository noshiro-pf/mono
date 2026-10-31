/** @jsxImportSource preact */
import { render } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import type { ScenarioFramework } from '../scenario.mjs';
import {
  computeSchedule,
  initialDurations,
  type ScheduleApp,
} from './model.mjs';
import { createScheduleOperations } from './schedule-operations.mjs';

/**
 * Preact without Signals, written as the React implementation is: the durations
 * are one state, and the render computes every figure in a `useMemo`. Preact
 * renders a state change in a microtask, which the harness waits for.
 */
export const preactSchedule: ScenarioFramework<ScheduleApp> = {
  name: 'Preact',
  mount: (container) => {
    const mut_view: {
      setDurations: ((durations: readonly number[]) => void) | undefined;
    } = { setDurations: undefined };

    const App = (): preact.JSX.Element => {
      const [durations, setDurations] = useState(initialDurations);

      // The setter is stable; the operations below call it from outside.
      mut_view.setDurations = setDurations;

      const rows = useMemo(() => computeSchedule(durations), [durations]);

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

    return createScheduleOperations(
      (durations) => {
        mut_view.setDurations?.(durations);
      },
      () => {
        render(null, container);
      },
    );
  },
} as const;
