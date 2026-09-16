import * as React from 'react';
import { cascadedDiamondResults, toColouredSeries } from './benchmark-data.mjs';
import { BenchmarkLineChart } from './benchmark-line-chart.js';

/**
 * Cascaded Diamond chart — shows ms vs cascade depth N.
 * Uses linear scale to make the exponential O(2^N) blowup of RxJS
 * visually obvious. Y-axis is capped at 500ms so that the differences
 * between the other libraries remain visible.
 */
export const CascadedDiamondChart = React.memo(() => (
  <BenchmarkLineChart
    logScale={false}
    series={series}
    xLabels={xLabels}
    yAxisLabel={'ms'}
    yMaxOverride={2100}
  />
));

CascadedDiamondChart.displayName = 'CascadedDiamondChart';

const colors = {
  SynState: '#3b82f6',
  RxJS: '#ef4444',
  Jotai: '#f59e0b',
  MobX: '#8b5cf6',
} as const;

const series = toColouredSeries(cascadedDiamondResults, colors);

const xLabels = cascadedDiamondResults.xLabels;
