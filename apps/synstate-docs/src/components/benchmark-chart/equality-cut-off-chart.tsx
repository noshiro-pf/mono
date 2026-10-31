import * as React from 'react';
import { equalityCutOffResults, toColouredSeries } from './benchmark-data.mjs';
import { BenchmarkLineChart } from './benchmark-line-chart.js';

/**
 * Equality Cut-Off chart — shows ms vs view count W.
 * SynState and RxJS with `distinctUntilChanged` stop at the equal bucket and
 * stay nearly flat; the libraries that reach every view below it on every
 * update (marking it, or calling its subscriber) grow with W, as does the dashed "(naive …)" RxJS line,
 * which does not compare at all.
 */
export const EqualityCutOffChart = React.memo(() => (
  <BenchmarkLineChart
    logScale
    series={series}
    xLabels={xLabels}
    yAxisLabel={'ms'}
  />
));

EqualityCutOffChart.displayName = 'EqualityCutOffChart';

const series = toColouredSeries(equalityCutOffResults);

const xLabels = equalityCutOffResults.xLabels;
