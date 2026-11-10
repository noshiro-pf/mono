import { createState, map } from 'synstate';
import { constant, render, type JSX } from 'synstate-dom';
import type { ScenarioFramework } from '../scenario.mjs';
import { combineAll } from '../synstate-graph.mjs';
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
 * mapped from the level. The cells bind the figures formatted with `map`.
 */
export const synstateDomZoom: ScenarioFramework<ZoomApp> = {
  name: 'synstate-dom',
  mount: (container) => {
    const [zoom$, setZoom] = createState(initialZoom);

    const level$ = zoom$.pipe(map(levelOf));

    const sizes = places.map((place) =>
      level$.pipe(map((level) => labelSizeOf(place, level))),
    );

    const shownCount$ = combineAll(sizes, shownCountOf);

    const App = (): JSX.Element => (
      <table>
        <tbody>
          <tr>
            <td>{zoom$.pipe(map(zoomText))}</td>
            <td>{level$.pipe(map((level) => level.toString()))}</td>
            <td>{shownCount$.pipe(map((count) => count.toString()))}</td>
          </tr>
          {sizes.slice(0, shownPlaces).map((size$, index) => (
            <tr>
              <td>{constant((index + 1).toString())}</td>
              <td>{size$.pipe(map(labelText))}</td>
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
} as const;
