import * as React from 'react';
import {
  conditionalFanOutResults,
  toColouredSeries,
} from './benchmark-data.mjs';
import { BenchmarkLineChart } from './benchmark-line-chart.js';

/**
 * Conditional Fan-Out chart — shows ms vs branch count B.
 * SynState scales linearly with B (its `derive` reads all branches); with
 * `switchMap` it follows the selected branch only and stays flat.
 * MobX is constant (inactive branch has no observers).
 */
export const ConditionalFanOutChart = React.memo(() => (
  <BenchmarkLineChart
    logScale
    series={series}
    xLabels={xLabels}
    yAxisLabel={'ms'}
  />
));

ConditionalFanOutChart.displayName = 'ConditionalFanOutChart';

const series = toColouredSeries(conditionalFanOutResults);

const xLabels = conditionalFanOutResults.xLabels;
