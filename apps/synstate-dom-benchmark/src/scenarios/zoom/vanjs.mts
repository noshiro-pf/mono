import van from 'vanjs-core';
import type { ScenarioFramework } from '../scenario.mjs';
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

const { table, tbody, td, tr } = van.tags;

/**
 * The zoom is a state, the level a `van.derive` reading it, and every label a
 * `van.derive` reading the level. Each cell is bound to a function that formats
 * a figure. A state assigned the value it already has does not propagate, so a
 * change within a level stops at the level.
 */
export const vanjsZoom: ScenarioFramework<ZoomApp> = {
  name: 'VanJS',
  mount: (container) => {
    const mut_zoom = van.state(initialZoom);

    const level = van.derive(() => levelOf(mut_zoom.val));

    const sizes = places.map((place) =>
      van.derive(() => labelSizeOf(place, level.val)),
    );

    const shownCount = van.derive(() =>
      shownCountOf(sizes.map((size) => size.val)),
    );

    van.add(
      container,
      table(
        tbody(
          tr(
            td(() => zoomText(mut_zoom.val)),
            td(() => level.val.toString()),
            td(() => shownCount.val.toString()),
          ),
          ...sizes.slice(0, shownPlaces).map((size, index) =>
            tr(
              td((index + 1).toString()),
              td(() => labelText(size.val)),
            ),
          ),
        ),
      ),
    );

    return {
      setZoom: (zoom) => {
        mut_zoom.val = zoom;
      },
      dispose: () => {
        container.replaceChildren();
      },
    } satisfies ZoomApp;
  },
} as const;
