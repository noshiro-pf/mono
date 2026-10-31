/** @jsxImportSource solid-js */
import { createMemo, createRoot, createSignal } from 'solid-js';
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
 * The zoom is a signal, the level a `createMemo` reading it, and every label a
 * `createMemo` reading the level. The cells read the figures in JSX
 * expressions, which Solid compiles into render effects.
 */
export const solidZoom: ScenarioFramework<ZoomApp> = {
  name: 'Solid',
  mount: (container) =>
    createRoot((dispose) => {
      const [zoom, setZoom] = createSignal(initialZoom);

      const level = createMemo(() => levelOf(zoom()));

      const sizes = places.map((place) =>
        createMemo(() => labelSizeOf(place, level())),
      );

      const shownCount = createMemo(() =>
        shownCountOf(sizes.map((size) => size())),
      );

      const element = (
        <table>
          <tbody>
            <tr>
              <td>{zoomText(zoom())}</td>
              <td>{level().toString()}</td>
              <td>{shownCount().toString()}</td>
            </tr>
            {sizes.slice(0, shownPlaces).map((size, index) => (
              <tr>
                <td>{(index + 1).toString()}</td>
                <td>{labelText(size())}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );

      // A `<table>` expression is a `HTMLTableElement` at run time; Solid types
      // every JSX expression as its broader `JSX.Element`.
      if (element instanceof Node) {
        container.append(element);
      }

      return {
        setZoom: (zoomValue) => {
          setZoom(zoomValue);
        },
        dispose: () => {
          dispose();

          container.replaceChildren();
        },
      } satisfies ZoomApp;
    }),
} as const;
