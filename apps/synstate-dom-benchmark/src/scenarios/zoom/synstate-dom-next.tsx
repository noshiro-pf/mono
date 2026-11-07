/** @jsxImportSource synstate-dom-next */
import { constant, render, type JSX } from 'synstate-dom-next';
import { map, state } from 'synstate-next';
import type { ScenarioFramework } from '../scenario.mjs';
import { deriveAllNext } from '../synstate-next-graph.mjs';
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
 * mapped from the level. `map` passes on only a value that changed, so most
 * changes of the zoom stop at the level. The cells format the figures with
 * `map`.
 */
export const synstateDomNextZoom: ScenarioFramework<ZoomApp> = {
  name: 'synstate-dom-next',
  mount: (container) => {
    const zoom = state(initialZoom);

    const level = zoom.pipe(map(levelOf));

    const sizes = places.map((place) =>
      level.pipe(map((l) => labelSizeOf(place, l))),
    );

    const shownCount = deriveAllNext(sizes, shownCountOf);

    const App = (): JSX.Element => (
      <table>
        <tbody>
          <tr>
            <td>{zoom.pipe(map(zoomText))}</td>
            <td>{level.pipe(map((l) => l.toString()))}</td>
            <td>{shownCount.pipe(map((count) => count.toString()))}</td>
          </tr>
          {sizes.slice(0, shownPlaces).map((size, index) => (
            <tr>
              <td>{constant((index + 1).toString())}</td>
              <td>{size.pipe(map(labelText))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    const unmount = render(App, container);

    return {
      setZoom: (value) => {
        zoom.set(value);
      },
      dispose: unmount,
    } satisfies ZoomApp;
  },
} as const;
