/** @jsxImportSource react */
import { useMemo, useState, type JSX } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { ScenarioFramework } from '../scenario.mjs';
import {
  initialZoom,
  labelSizesAt,
  levelOf,
  zoomCells,
  type ZoomApp,
} from './model.mjs';

/**
 * The zoom is a state, and the render computes every label in a loop, in a
 * `useMemo` that depends on the level, so that a change within a level does
 * not repeat it. Each change is rendered with `flushSync`, as a click
 * handler's update is.
 */
export const reactZoom: ScenarioFramework<ZoomApp> = {
  name: 'React',
  mount: (container) => {
    const root = createRoot(container);

    const mut_view: { setZoom: ((zoom: number) => void) | undefined } = {
      setZoom: undefined,
    };

    const App = (): JSX.Element => {
      const [zoom, setZoom] = useState(initialZoom);

      // The setter is stable; the operations below call it from outside.
      mut_view.setZoom = setZoom;

      const level = levelOf(zoom);

      const sizes = useMemo(() => labelSizesAt(level), [level]);

      const rows = zoomCells(zoom, sizes);

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

    return {
      setZoom: (zoom) => {
        flushSync(() => {
          mut_view.setZoom?.(zoom);
        });
      },
      dispose: () => {
        root.unmount();
      },
    } satisfies ZoomApp;
  },
} as const;
