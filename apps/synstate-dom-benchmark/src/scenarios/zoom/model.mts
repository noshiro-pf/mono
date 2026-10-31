import { Arr } from 'ts-data-forge';
import type { Cells } from '../scenario.mjs';

/**
 * The map every implementation under this directory renders: the labels of
 * {@link placeCount} places at a zoom that can be set in steps of 0.1.
 *
 * The zoom is turned into a whole level of detail, and every label's size is
 * computed from that level alone: a place is shown from the level of its rank
 * on, at a size that grows with the level. So most changes of the zoom stop at
 * the level, which comes out the same, and only a change across a whole level
 * reaches the {@link placeCount} labels. The screen shows the zoom, the level
 * and the number of labels shown, and the first {@link shownPlaces} places.
 *
 * The signal-based implementations make one derived value for the level and one
 * per label; React and Preact compute the labels in a loop, again only when the
 * level changes.
 */
export type ZoomApp = Readonly<{
  setZoom: (zoom: number) => void;
  dispose: () => void;
}>;

export type Place = Readonly<{
  /** The level from which the place is shown. */
  rank: number;
  /** Its size in pixels at level 0. */
  baseSize: number;
}>;

export const placeCount = 10_000;

export const shownPlaces = 50;

export const maxLevel = 20;

export const initialZoom = 10.3;

/**
 * Builds `count` places with ranks from 0 to {@link maxLevel} − 1 and base
 * sizes from 8 to 15 pixels. The generator is seeded, so every implementation
 * is given the same map.
 */
export const createPlaces = (count: number): readonly Place[] => {
  const mut_state = { seed: 11 };

  const random = (max: number): number => {
    // xorshift32, as in `data.mts`.
    let mut_x = mut_state.seed;

    mut_x ^= mut_x << 13;

    mut_x ^= mut_x >>> 17;

    mut_x ^= mut_x << 5;

    mut_state.seed = mut_x >>> 0;

    return mut_state.seed % max;
  };

  return Array.from({ length: count }, () => ({
    rank: random(maxLevel),
    baseSize: 8 + random(8),
  }));
};

export const places: readonly Place[] = createPlaces(placeCount);

export const levelOf = (zoom: number): number => Math.floor(zoom);

/** The label's size in pixels at `level`, or 0 while the place is hidden. */
export const labelSizeOf = (place: Place, level: number): number =>
  place.rank <= level ? Math.round(place.baseSize * 1.1 ** level) : 0;

export const shownCountOf = (sizes: readonly number[]): number =>
  sizes.filter((size) => size > 0).length;

/** Every label's size at `level`, in one loop. */
export const labelSizesAt = (level: number): readonly number[] =>
  places.map((place) => labelSizeOf(place, level));

export const zoomText = (zoom: number): string => zoom.toFixed(1);

export const labelText = (size: number): string =>
  size === 0 ? '–' : (`${size}px` as const);

/** The cells of the summary row: the zoom, the level, the labels shown. */
export const zoomSummaryCells = (
  zoom: number,
  level: number,
  shownCount: number,
): readonly string[] =>
  [zoomText(zoom), level.toString(), shownCount.toString()] as const;

/** The cells of a place's row: its number and its label. */
export const placeCells = (index: number, size: number): readonly string[] =>
  [(index + 1).toString(), labelText(size)] as const;

/**
 * The cells of the screen from the zoom and the label sizes at its level:
 * what React and Preact render.
 */
export const zoomCells = (zoom: number, sizes: readonly number[]): Cells =>
  Arr.toUnshifted(zoomSummaryCells(zoom, levelOf(zoom), shownCountOf(sizes)))(
    sizes.slice(0, shownPlaces).map((size, index) => placeCells(index, size)),
  );

/** Every figure, computed in one loop: what the harness checks against. */
export const computeZoom = (zoom: number): Cells =>
  zoomCells(zoom, labelSizesAt(levelOf(zoom)));
