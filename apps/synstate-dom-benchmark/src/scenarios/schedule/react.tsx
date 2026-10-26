/** @jsxImportSource react */
import { useMemo, useState, type JSX } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { ScenarioFramework } from '../scenario.mjs';
import {
  computeSchedule,
  initialDurations,
  type ScheduleApp,
} from './model.mjs';
import { createScheduleOperations } from './schedule-operations.mjs';

/**
 * The durations are one state, and the render computes every figure from them
 * in a loop, in a `useMemo`; there is no graph to propagate through. Each
 * change is rendered with `flushSync`, as a click handler's update is.
 */
export const reactSchedule: ScenarioFramework<ScheduleApp> = {
  name: 'React',
  mount: (container) => {
    const root = createRoot(container);

    const mut_view: {
      setDurations: ((durations: readonly number[]) => void) | undefined;
    } = { setDurations: undefined };

    const App = (): JSX.Element => {
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

    flushSync(() => {
      root.render(<App />);
    });

    return createScheduleOperations(
      (durations) => {
        flushSync(() => {
          mut_view.setDurations?.(durations);
        });
      },
      () => {
        root.unmount();
      },
    );
  },
} as const;
