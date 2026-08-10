import * as React from 'react';
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

const series = [
  {
    label: 'SynState',
    color: '#3b82f6',
    values: [0.5, 0.6, 0.5, 0.5, 0.8, 1.9, 6.2, 23.1, 90.8, 359.2],
  },
  {
    label: 'RxJS',
    color: '#ef4444',
    values: [
      0.2,
      0.5,
      2.1,
      11.1,
      60.2,
      373.9,
      2018.1,
      undefined,
      undefined,
      undefined,
    ],
  },
  {
    label: 'Jotai',
    color: '#f59e0b',
    values: [1.5, 1.9, 2.5, 5.3, 7.2, 13, 35.9, 116.4, 414.5, undefined],
  },
  {
    label: 'MobX',
    color: '#8b5cf6',
    values: [1, 0.6, 0.9, 0.8, 0.9, 0.9, 1, 1.1, 1.2, 1.3],
  },
] as const;

const xLabels = [
  '2',
  '4',
  '6',
  '8',
  '10',
  '12',
  '14',
  '16',
  '18',
  '20',
] as const;
