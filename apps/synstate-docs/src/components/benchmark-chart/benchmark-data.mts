import {
  cascadedDiamond,
  conditionalFanOut,
  deepChain,
  equalityCutOff,
  isNaiveForm,
  libraryColorOf,
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

export const equalityCutOffResults: SeriesResults = equalityCutOff;

/**
 * Pairs each library's measurements with the colour every chart draws it in
 * (`libraryColorOf`), and marks the rows written naively on purpose
 * (`isNaiveForm`), which a line chart draws dashed.
 *
 * The grey fallback is never drawn on a committed page: `gen:benchmark-doc`
 * fails on a results label that has no colour.
 *
 * `undefined` rather than `null` for a timed-out point, because that is what
 * the chart components treat as "no marker here".
 */
export const toColouredSeries = (
  results: SeriesResults,
): readonly Readonly<{
  label: string;
  color: string;
  naive: boolean;
  values: readonly (number | undefined)[];
}>[] =>
  results.series.map(({ label, values }) => ({
    label,
    color: libraryColorOf(label) ?? '#6b7280',
    naive: isNaiveForm(label),
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
