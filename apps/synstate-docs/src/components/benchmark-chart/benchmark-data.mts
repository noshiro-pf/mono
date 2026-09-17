import { type ReadonlyRecord } from 'ts-type-forge';
import {
  cascadedDiamond,
  conditionalFanOut,
  deepChain,
} from '../../data/index.mjs';

/**
 * The benchmark numbers, read from what the runners wrote.
 *
 * The charts used to carry their own copy of every value, so a re-measurement
 * updated the tables and left the lines beside them drawn from the previous
 * run. These come from the same files `gen:benchmark-doc` embeds, so the two
 * cannot disagree.
 *
 * The relative paths reach across the package boundary because `samples/` is
 * not published — `libs/synstate`'s `files` ships `src`, `dist` and `assets`.
 * They are confined to this module so that the charts do not each repeat them.
 */
export type SeriesResults = Readonly<{
  kind: string;
  xLabels: readonly string[];
  series: readonly Readonly<{
    label: string;
    values: readonly (number | null)[];
  }>[];
}>;

export const deepChainResults: SeriesResults = deepChain;

export const cascadedDiamondResults: SeriesResults = cascadedDiamond;

export const conditionalFanOutResults: SeriesResults = conditionalFanOut;

/**
 * Pairs each library's measurements with the colour the chart draws it in.
 *
 * `undefined` rather than `null` for a timed-out point, because that is what
 * the chart components treat as "no marker here".
 */
export const toColouredSeries = (
  results: SeriesResults,
  colors: ReadonlyRecord<string, string>,
): readonly Readonly<{
  label: string;
  color: string;
  values: readonly (number | undefined)[];
}>[] =>
  results.series.map(({ label, values }) => ({
    label,
    color: colors[label] ?? '#6b7280',
    values: values.map((v) => v ?? undefined),
  }));

/**
 * Transposes per-library rows into the per-parameter groups a bar chart wants:
 * one group per x label, holding one value per library in `results.series`
 * order.
 */
export const toGroups = (
  results: SeriesResults,
): readonly Readonly<{ label: string; values: readonly number[] }>[] =>
  results.xLabels.map((label, i) => ({
    label,
    values: results.series.map(({ values }) => values[i] ?? 0),
  }));
