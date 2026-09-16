import * as React from 'react';
import { BenchmarkBarChart } from './benchmark-bar-chart.js';
import {
  deepChainResults,
  toColouredSeries,
  toGroups,
} from './benchmark-data.mjs';

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

const colors = {
  SynState: '#3b82f6',
  RxJS: '#ef4444',
  Jotai: '#f59e0b',
  MobX: '#8b5cf6',
} as const;

// The bar chart wants one group per (K, M) point, and takes the labels from
// the group; the newline keeps K and M on separate lines under the axis.
const groups = toGroups(deepChainResults).map(({ label, values }) => ({
  label: label.replace(', ', '\n'),
  values,
}));

const series = toColouredSeries(deepChainResults, colors).map(
  ({ label, color }) => ({ label, color }),
);

const style = {
  textAlign: 'center',
  fontSize: '0.85em',
  color: 'var(--sl-color-gray-3, #6b7280)',
  marginTop: '-0.5em',
} as const;
