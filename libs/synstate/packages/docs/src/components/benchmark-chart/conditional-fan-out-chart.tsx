import * as React from 'react';
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

const series = [
  {
    label: 'SynState',
    color: '#3b82f6',
    values: [24.2, 24.2, 33.7, 48.1, 90.8, 154, 297.4, 703.3, 1466],
  },
  {
    label: 'RxJS',
    color: '#ef4444',
    values: [5.6, 5.3, 5.1, 5.4, 6.1, 9.2, 22.3, 37.2, 61.4],
  },
  {
    label: 'Jotai',
    color: '#f59e0b',
    values: [69.6, 69.8, 73.7, 68.8, 72.1, 69, 70.5, 72.5, 69.9],
  },
  {
    label: 'MobX',
    color: '#8b5cf6',
    values: [2.3, 2.5, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.7],
  },
] as const;

const xLabels = [
  '2',
  '5',
  '10',
  '20',
  '50',
  '100',
  '200',
  '500',
  '1000',
] as const;
