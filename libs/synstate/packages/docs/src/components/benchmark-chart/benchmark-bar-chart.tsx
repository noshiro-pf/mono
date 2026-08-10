import * as React from 'react';
import { Arr, PositiveSafeInt } from 'ts-data-forge';
import {
  createToY,
  formatTickLabel,
  generateLinearTicks,
  generateLogTicks,
} from './chart-utils.mjs';

type BarGroup = Readonly<{
  label: string;
  values: readonly number[];
}>;

type BarSeries = Readonly<{
  label: string;
  color: string;
}>;

type Props = Readonly<{
  /** Groups on the X-axis (each group = one parameter combination) */
  groups: readonly BarGroup[];
  /** One entry per bar within each group */
  series: readonly BarSeries[];
  /** Y-axis label */
  yAxisLabel?: string;
  /** Override the Y-axis maximum */
  yMaxOverride?: number;
  /** Use logarithmic Y-axis */
  logScale?: boolean;
}>;

const CHART_WIDTH = 720;

const CHART_HEIGHT = 380;

const PADDING = { top: 20, right: 30, bottom: 58, left: 70 } as const;

const PLOT_W = CHART_WIDTH - PADDING.left - PADDING.right;

const PLOT_H = CHART_HEIGHT - PADDING.top - PADDING.bottom;

export const BenchmarkBarChart = React.memo<Props>((props) => {
  const {
    groups,
    series,
    yAxisLabel = 'ms',
    yMaxOverride,
    logScale = false,
  } = props;

  // Collect all values to determine Y range
  const allValues = groups.flatMap((g) => g.values);

  if (Arr.isEmpty(allValues)) return undefined;

  const yMin = logScale ? 0.1 : 0;

  const yMax = (yMaxOverride ?? Math.max(...allValues)) * 1.15;

  const toY = createToY(PLOT_H, yMin, yMax, logScale);

  // Layout: groups evenly spaced across PLOT_W
  const groupCount = groups.length;

  const barCount = series.length;

  // eslint-disable-next-line total-functions/no-partial-division
  const groupWidth = PLOT_W / groupCount;

  const groupPadding = groupWidth * 0.18;

  const usableGroupWidth = groupWidth - groupPadding * 2;

  // eslint-disable-next-line total-functions/no-partial-division
  const barWidth = usableGroupWidth / barCount;

  const barGap = barWidth * 0.1;

  const actualBarWidth = barWidth - barGap;

  const groupCenterX = (groupIndex: number): number =>
    groupIndex * groupWidth + groupWidth * 0.5;

  const barX = (groupIndex: number, barIndex: number): number =>
    groupIndex * groupWidth + groupPadding + barIndex * barWidth + barGap * 0.5;

  const yTicks = logScale
    ? generateLogTicks(yMin, yMax)
    : generateLinearTicks(PositiveSafeInt.fromNumber(yMax));

  return (
    <svg
      style={svgStyle}
      viewBox={`0 0 ${String(CHART_WIDTH)} ${String(CHART_HEIGHT)}`}
    >
      <g
        transform={`translate(${String(PADDING.left)}, ${String(PADDING.top)})`}
      >
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <line
            key={tick}
            stroke={'var(--sl-color-gray-5, #e5e7eb)'}
            strokeWidth={0.5}
            x1={0}
            x2={PLOT_W}
            y1={toY(tick)}
            y2={toY(tick)}
          />
        ))}

        {/* Bars */}
        {groups.map((group, gi) =>
          group.values.map((value, bi) => {
            const x = barX(gi, bi);

            const y = toY(value);

            const height = PLOT_H - y;

            return (
              <rect
                key={`${group.label}-${series[bi]?.label ?? String(bi)}`}
                fill={series[bi]?.color ?? '#999'}
                height={Math.max(0, height)}
                rx={1.5}
                width={actualBarWidth}
                x={x}
                y={y}
              />
            );
          }),
        )}

        {/* Y-axis */}
        <line
          stroke={'var(--sl-color-gray-3, #6b7280)'}
          strokeWidth={1}
          x1={0}
          x2={0}
          y1={0}
          y2={PLOT_H}
        />
        {yTicks.map((tick) => (
          <text
            key={tick}
            dominantBaseline={'middle'}
            fill={'var(--sl-color-gray-3, #6b7280)'}
            fontSize={11}
            textAnchor={'end'}
            x={-8}
            y={toY(tick)}
          >
            {formatTickLabel(tick)}
          </text>
        ))}

        {/* Y-axis label */}
        <text
          dominantBaseline={'middle'}
          fill={'var(--sl-color-gray-3, #6b7280)'}
          fontSize={12}
          textAnchor={'middle'}
          transform={`translate(${String(-PADDING.left + 16)}, ${String(PLOT_H / 2)}) rotate(-90)`}
        >
          {yAxisLabel}
        </text>

        {/* X-axis */}
        <line
          stroke={'var(--sl-color-gray-3, #6b7280)'}
          strokeWidth={1}
          x1={0}
          x2={PLOT_W}
          y1={PLOT_H}
          y2={PLOT_H}
        />
        {groups.map((group, gi) => {
          const cx = groupCenterX(gi);

          const parts = group.label.split('\n');

          return (
            <text
              key={group.label}
              fill={'var(--sl-color-gray-3, #6b7280)'}
              fontSize={10}
              textAnchor={'middle'}
              x={cx}
              y={PLOT_H + 12}
            >
              {parts.map((part, pi) => (
                <tspan key={part} dy={pi === 0 ? 0 : 12} x={cx}>
                  {part}
                </tspan>
              ))}
            </text>
          );
        })}

        {/* Legend (top-left) */}
        {series.map((s, i) => {
          const lx = 8;

          const ly = i * 18 + 4;

          return (
            <g key={s.label}>
              <rect
                fill={s.color}
                height={10}
                rx={2}
                width={14}
                x={lx}
                y={ly - 5}
              />
              <text
                dominantBaseline={'middle'}
                fill={'var(--sl-color-text, #1f2937)'}
                fontSize={11}
                x={lx + 20}
                y={ly}
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
});

BenchmarkBarChart.displayName = 'BenchmarkBarChart';

const svgStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: `${String(CHART_WIDTH)}px`,
  height: 'auto',
} as const;
