import * as React from 'react';
import { BenchmarkBarChart } from './benchmark-bar-chart.js';

/**
 * Deep Chain Throughput chart — shows ms vs (K, M) parameter combinations.
 * Uses a grouped bar chart since there are two varying parameters (K and M).
 * Logarithmic Y-axis to make the wide range (0.3ms–678ms) comparable.
 */
export const DeepChainChart = React.memo(() => (
  <div>
    <BenchmarkBarChart
      groups={groups}
      logScale
      series={series}
      yAxisLabel={'ms (log scale)'}
    />
    <p style={style}>
      {
        '⚠ Y-axis is logarithmic. Equal bar heights represent equal ratios, not equal differences.'
      }
    </p>
  </div>
));

DeepChainChart.displayName = 'DeepChainChart';

const groups = [
  { label: 'K=100\nM=50', values: [0.4, 3.3, 9.2, 18.9] },
  { label: 'K=500\nM=50', values: [1, 14.6, 46.5, 79.4] },
  { label: 'K=1000\nM=50', values: [1.5, 31.1, 91.3, 156.2] },
  { label: 'K=100\nM=100', values: [0.3, 14.2, 17.2, 30] },
  { label: 'K=500\nM=100', values: [1.6, 66.7, 89.6, 150.1] },
  { label: 'K=1000\nM=100', values: [2.8, 135, 182.9, 289.9] },
  { label: 'K=500\nM=200', values: [2.9, 335.3, 194.5, 289.8] },
  { label: 'K=1000\nM=200', values: [5.6, 678.4, 398.5, 575.2] },
] as const;

const series = [
  { label: 'SynState', color: '#3b82f6' },
  { label: 'RxJS', color: '#ef4444' },
  { label: 'Jotai', color: '#f59e0b' },
  { label: 'MobX', color: '#8b5cf6' },
] as const;

const style = {
  textAlign: 'center',
  fontSize: '0.85em',
  color: 'var(--sl-color-gray-3, #6b7280)',
  marginTop: '-0.5em',
} as const;
