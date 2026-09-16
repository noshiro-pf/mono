import * as React from 'react';
import {
  conditionalFanOutResults,
  toColouredSeries,
} from './benchmark-data.mjs';
import { BenchmarkLineChart } from './benchmark-line-chart.js';

/**
 * Conditional Fan-Out chart — shows ms vs branch count B.
 * SynState scales linearly with B (combine includes all branches).
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

const colors = {
  SynState: '#3b82f6',
  RxJS: '#ef4444',
  Jotai: '#f59e0b',
  MobX: '#8b5cf6',
} as const;

const series = toColouredSeries(conditionalFanOutResults, colors);

const xLabels = conditionalFanOutResults.xLabels;
