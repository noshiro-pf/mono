import { createState, map } from 'synstate';
import { constant, render, view, type JSX } from 'synstate-dom';
import type { ScenarioFramework } from '../scenario.mjs';
import {
  changedValuesOnly,
  combineAll,
  everyValue,
  type FigureOutput,
} from '../synstate-graph.mjs';
import {
  initialZoom,
  labelSizeOf,
  labelText,
  levelOf,
  places,
  shownCountOf,
  shownPlaces,
  zoomText,
  type ZoomApp,
} from './model.mjs';

/**
 * The zoom is a state, the level a node mapped from it, and every label a node
 * mapped from the level. The cells bind the figures with `view`, which
 * formats them without adding a node.
 *
 * Measured twice: as written, and with a `skipIfNoChange` after every figure
 * (see {@link FigureOutput}), the level included.
 */
const synstateDomZoomWith = (
  name: string,
  output: FigureOutput,
): ScenarioFramework<ZoomApp> =>
  ({
    name,
    mount: (container) => {
      const [zoom$, setZoom] = createState(initialZoom);

      const level$ = output(zoom$.pipe(map(levelOf)));

      const sizes = places.map((place) =>
        output(level$.pipe(map((level) => labelSizeOf(place, level)))),
      );

      const shownCount$ = combineAll(sizes, shownCountOf, output);

      const App = (): JSX.Element => (
        <table>
          <tbody>
            <tr>
              <td>{view(zoom$, zoomText)}</td>
              <td>{view(level$, (level) => level.toString())}</td>
              <td>{view(shownCount$, (count) => count.toString())}</td>
            </tr>
            {sizes.slice(0, shownPlaces).map((size$, index) => (
              <tr>
                <td>{constant((index + 1).toString())}</td>
                <td>{view(size$, labelText)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );

      const unmount = render(App, container);

      return {
        setZoom,
        dispose: unmount,
      } satisfies ZoomApp;
    },
  }) as const;

export const synstateDomZoom = synstateDomZoomWith('synstate-dom', everyValue);

export const synstateDomZoomChangedOnly = synstateDomZoomWith(
  'synstate-dom (skipIfNoChange)',
  changedValuesOnly,
);
