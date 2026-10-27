import { Card } from 'blueprint-synstate';
import { constant, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import {
  ageAt,
  formatYearMonth,
  monthOf,
  type MonthIndex,
  type SimulationResult,
} from '../../domain/index.mjs';
import { input$, result$, updateSection } from '../../store/index.mjs';
import { formatYen } from '../../utils/index.mjs';
import { LineChart, type ChartPoint } from '../chart/index.mjs';
import { NumberField, OutputField, TextField } from '../fields/index.mjs';

/** `収支グラフ` シート: 前提の入力、判定、グラフ。 */
export const OverviewTab = (): JSX.Element => {
  const chartData = view(result$, toChartData);

  return (
    <div class={constant('tab-body')}>
      <Card>
        <h2 class={constant('bp6-heading')}>{constant('判定')}</h2>
        <ul class={constant('checks')} data-e2e={constant('checks')}>
          {checkItems.map(({ label, pick }) => (
            <li class={{ ng: view(result$, (r) => pick(r) !== undefined) }}>
              {view(result$, (r) => {
                const failed = pick(r);

                return failed === undefined
                  ? `OK: ${label}`
                  : `NG: ${label}（${failureLabel(failed, r.birth)} から）`;
              })}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h2 class={constant('bp6-heading')}>
          {constant('資産の推移（各年の最後の月）')}
        </h2>
        <LineChart
          label={constant('資産の推移')}
          data={chartData}
          series={chartSeries}
        />
      </Card>
      <Card>
        <h2 class={constant('bp6-heading')}>{constant('基本情報')}</h2>
        <div class={constant('form')}>
          <TextField
            label="生年月"
            type="month"
            value={view(input$, (i) => i.profile.birth)}
            onChange={(birth) => {
              updateSection('profile', (p) => ({ ...p, birth }));
            }}
          />
          <TextField
            label="シミュレーション開始年月"
            type="month"
            value={view(input$, (i) => i.profile.start)}
            onChange={(start) => {
              updateSection('profile', (p) => ({ ...p, start }));
            }}
          />
          <NumberField
            label="何歳まで計算するか"
            value={view(input$, (i) => i.profile.endAge)}
            onChange={(endAge) => {
              updateSection('profile', (p) => ({ ...p, endAge }));
            }}
          />
        </div>
      </Card>
      <Card>
        <h2 class={constant('bp6-heading')}>{constant('前提')}</h2>
        <div class={constant('form')}>
          {assumptionFields.map((f) => (
            <NumberField
              label={f.label}
              unit={f.unit}
              e2e={f.e2e}
              value={view(input$, (i) => i.assumptions[f.key])}
              onChange={(value) => {
                updateSection('assumptions', (a) => ({ ...a, [f.key]: value }));
              }}
            />
          ))}
          <TextField
            label="現預金の下限の判定を始める年月"
            type="month"
            value={view(input$, (i) => i.assumptions.cashThresholdCheckFrom)}
            onChange={(cashThresholdCheckFrom) => {
              updateSection('assumptions', (a) => ({
                ...a,
                cashThresholdCheckFrom,
              }));
            }}
          />
          <OutputField
            label="日常生活費（月、開始時点）"
            value={view(input$, (i) =>
              formatYen(Arr.sum(i.livingCosts.map((c) => c.monthly))),
            )}
          />
        </div>
      </Card>
    </div>
  );
};

const checkItems = [
  { label: '月末の現預金の額 ≥ 0', pick: (r) => r.checks.cashNonNegative },
  {
    label: '月末の現預金の額 ≥ 下限',
    pick: (r) => r.checks.cashAboveThreshold,
  },
  { label: '積立 NISA 資産額合計 ≥ 0', pick: (r) => r.checks.nisaNonNegative },
  {
    label: '投信（課税枠）資産額合計 ≥ 0',
    pick: (r) => r.checks.taxableNonNegative,
  },
  {
    label: '積立 NISA 生涯投資枠 ≤ 1,800 万円',
    pick: (r) => r.checks.nisaWithinLifetimeLimit,
  },
] as const satisfies readonly Readonly<{
  label: string;
  pick: (r: SimulationResult) => MonthIndex | undefined;
}>[];

const assumptionFields = [
  {
    key: 'retirementAge',
    label: '何歳まで働くか',
    unit: 'plain',
    e2e: 'retirement-age',
  },
  {
    key: 'pensionStartAge',
    label: '年金を何歳から受給するか（60〜75）',
    unit: 'plain',
    e2e: undefined,
  },
  {
    key: 'dcLumpSumAge',
    label: '確定拠出年金を何歳に一括受給するか',
    unit: 'plain',
    e2e: undefined,
  },
  {
    key: 'livingCostInflationRate',
    label: '生活費の物価上昇率（年 %）',
    unit: 'percent',
    e2e: undefined,
  },
  {
    key: 'yieldWorking',
    label: '運用利回り・現役時代（年 %）',
    unit: 'percent',
    e2e: undefined,
  },
  {
    key: 'yieldRetired',
    label: '運用利回り・老後（年 %）',
    unit: 'percent',
    e2e: undefined,
  },
  {
    key: 'yieldSwitchAge',
    label: '何歳から老後の運用利回りにするか',
    unit: 'plain',
    e2e: undefined,
  },
  {
    key: 'initialCash',
    label: '開始時点の現預金（円）',
    unit: 'plain',
    e2e: 'initial-cash',
  },
  {
    key: 'cashThreshold',
    label: '現預金の下限（円）',
    unit: 'plain',
    e2e: undefined,
  },
] as const;

const chartSeries = [
  { name: '現預金', color: 'var(--series-1)' },
  { name: '積立 NISA', color: 'var(--series-2)' },
  { name: '投信（課税枠）', color: 'var(--series-3)' },
  { name: '確定拠出年金', color: 'var(--series-4)' },
] as const;

const toChartData = (r: SimulationResult): readonly ChartPoint[] =>
  r.rows
    .filter((row) => monthOf(row.month) === 12)
    .map((row) => ({
      x: row.age,
      values: [
        row.cash,
        row.nisaValue,
        row.taxableValue,
        row.definedContributionValue,
      ],
    }));

const failureLabel = (month: MonthIndex, birth: MonthIndex): string =>
  `${formatYearMonth(month)}、${ageAt(month, birth)} 歳` as const;
