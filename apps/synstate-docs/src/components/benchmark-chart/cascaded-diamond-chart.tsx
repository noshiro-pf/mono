import * as React from 'react';
import { cascadedDiamondResults, toColouredSeries } from './benchmark-data.mjs';
import { BenchmarkLineChart } from './benchmark-line-chart.js';

/**
 * Cascaded Diamond chart — shows ms vs cascade depth N.
 *
 * Linear, so that RxJS's exponential O(2^N) blowup reads as one. The Y-axis
 * ends at the largest value of the libraries that finished every N: RxJS, which
 * times out, passes the top within a few steps of N, and an axis reaching its
 * last measured value flattens the others to the X-axis. Its points above the
 * top are labelled with their values.
 */
export const CascadedDiamondChart = React.memo(() => (
  <BenchmarkLineChart
    logScale={false}
    scaleByCompleteSeries
    series={series}
    xLabels={xLabels}
    yAxisLabel={'ms'}
  />
));

CascadedDiamondChart.displayName = 'CascadedDiamondChart';

const series = toColouredSeries(cascadedDiamondResults);

const xLabels = cascadedDiamondResults.xLabels;
