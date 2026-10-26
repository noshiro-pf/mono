import type { Scenario } from '../scenario.mjs';
import { computeZoom, initialZoom, type ZoomApp } from './model.mjs';
import { preactSignalsZoom } from './preact-signals.js';
import { preactZoom } from './preact.js';
import { reactZoom } from './react.js';
import { solidZoom } from './solid.js';
import { synstateDomZoom, synstateDomZoomChangedOnly } from './synstate-dom.js';
import { vanjsZoom } from './vanjs.mjs';

/** Setting the zoom to `zoom`, from the initial one. */
const zoomCase = (
  name: string,
  zoom: number,
): Scenario<ZoomApp>['cases'][number] =>
  ({
    name,
    apply: (app) => {
      app.setZoom(zoom);
    },
    revert: (app) => {
      app.setZoom(initialZoom);
    },
    expected: computeZoom(zoom),
  }) as const;

/**
 * The labels of 10,000 places at a zoom. A change within a level stops at
 * the level, which comes out the same, so that only the zoom on the screen
 * changes; a change to the next level reaches every label. A library that
 * stops at a value that did not change does almost nothing in the first case,
 * whatever the size of the graph below it.
 */
export const zoomScenario: Scenario<ZoomApp> = {
  buildName: 'zoom: build the map',
  initial: computeZoom(initialZoom),
  cases: [
    zoomCase('zoom: zoom within a level', initialZoom + 0.1),
    zoomCase('zoom: zoom to the next level', Math.floor(initialZoom) + 1),
  ],
  frameworks: [
    synstateDomZoom,
    synstateDomZoomChangedOnly,
    solidZoom,
    preactSignalsZoom,
    preactZoom,
    reactZoom,
    vanjsZoom,
  ],
} as const;
