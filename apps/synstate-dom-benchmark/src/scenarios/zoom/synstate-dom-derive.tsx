import { createState, map } from 'synstate';
import { constant, render, type JSX } from 'synstate-dom';
import type { ScenarioFramework } from '../scenario.mjs';
import { deriveAll } from '../synstate-graph.mjs';
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
 * synstate-dom-next's form (see `./synstate-dom-next.tsx`) with synstate and
 * synstate-dom, for the `next` set: the level and every label are a `map`, and
 * the count of shown labels one `derive`, both passing on only a value that
 * changed. The cells format the figures with `.pipe(map(f))`, as synstate-dom
 * binds a transformed value.
 */
export const synstateDomDeriveZoom: ScenarioFramework<ZoomApp> = {
  name: 'synstate-dom (derive)',
  mount: (container) => {
    const [zoom, setZoom] = createState(initialZoom);

    const level = zoom.pipe(map(levelOf));

    const sizes = places.map((place) =>
      level.pipe(map((l) => labelSizeOf(place, l))),
    );

    const shownCount = deriveAll(sizes, shownCountOf);

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
      setZoom,
      dispose: unmount,
    } satisfies ZoomApp;
  },
} as const;
