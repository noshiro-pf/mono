import {
  createState,
  debounce,
  derive,
  map,
  type InitializedObservable,
} from 'synstate';
import type { Percent } from 'ts-type-forge';
import type { Hue } from 'ts-utils-additional';
import { calcAll } from './functions/index.mjs';
import type { DivisionNumber } from './types/index.mjs';

export const [saturation$, setSaturation] = createState<Percent>(80);

export const [lightness$, setLightness] = createState<Percent>(60);

export const [firstHue$, setFirstHue] = createState<Hue>(0);

export const [divisionNumber$, setDivisionNumber] =
  createState<DivisionNumber>(14);

export const [tabIndex$, setTabIndex] = createState<number>(0);

/**
 * Every figure of the luminance tab, recomputed once the sliders have been
 * still for 200 ms rather than on every step of a drag.
 */
export const results$: InitializedObservable<ReturnType<typeof calcAll>> =
  derive(
    [saturation$, lightness$, firstHue$, divisionNumber$],
    (saturation, lightness, firstHue, divisionNumber) => ({
      saturation,
      lightness,
      firstHue,
      divisionNumber,
    }),
  )
    .pipe(debounce(200))
    .pipe(map(calcAll));
