/** @jsxImportSource preact */
import { render } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import type { ScenarioFramework } from '../scenario.mjs';
import {
  initialZoom,
  labelSizesAt,
  levelOf,
  zoomCells,
  type ZoomApp,
} from './model.mjs';

/**
 * Preact without Signals, written as the React implementation is: the zoom is
 * a state, and the render computes every label in a `useMemo` that depends on
 * the level. Preact renders a state change in a microtask, which the harness
 * waits for.
 */
export const preactZoom: ScenarioFramework<ZoomApp> = {
  name: 'Preact',
  mount: (container) => {
    const mut_view: { setZoom: ((zoom: number) => void) | undefined } = {
      setZoom: undefined,
    };

    const App = (): preact.JSX.Element => {
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

    render(<App />, container);

    return {
      setZoom: (zoom) => {
        mut_view.setZoom?.(zoom);
      },
      dispose: () => {
        render(null, container);
      },
    } satisfies ZoomApp;
  },
} as const;
