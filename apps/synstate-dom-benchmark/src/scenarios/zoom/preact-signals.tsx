/** @jsxImportSource preact */
import { computed, signal, type ReadonlySignal } from '@preact/signals';
import { render } from 'preact';
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

/**
 * The zoom is a signal, the level a `computed` reading it, and every label a
 * `computed` reading the level. Each cell is a `computed` that formats a
 * figure, passed to the DOM as a signal so that it binds without re-rendering a
 * component.
 */
export const preactSignalsZoom: ScenarioFramework<ZoomApp> = {
  name: 'Preact + Signals',
  mount: (container) => {
    const mut_zoom = signal(initialZoom);

    const level = computed(() => levelOf(mut_zoom.value));

    const sizes = places.map((place) =>
      computed(() => labelSizeOf(place, level.value)),
    );

    const shownCount = computed(() =>
      shownCountOf(sizes.map((size) => size.value)),
    );

    const formatted = (
      figure: ReadonlySignal<number>,
      format: (value: number) => string,
    ): ReadonlySignal<string> => computed(() => format(figure.value));

    render(
      <table>
        <tbody>
          <tr>
            <td>{formatted(mut_zoom, zoomText)}</td>
            <td>{formatted(level, (n) => n.toString())}</td>
            <td>{formatted(shownCount, (n) => n.toString())}</td>
          </tr>
          {sizes.slice(0, shownPlaces).map((size, index) => (
            <tr key={index}>
              <td>{(index + 1).toString()}</td>
              <td>{formatted(size, labelText)}</td>
            </tr>
          ))}
        </tbody>
      </table>,
      container,
    );

    return {
      setZoom: (zoom) => {
        mut_zoom.value = zoom;
      },
      dispose: () => {
        render(null, container);
      },
    } satisfies ZoomApp;
  },
} as const;
