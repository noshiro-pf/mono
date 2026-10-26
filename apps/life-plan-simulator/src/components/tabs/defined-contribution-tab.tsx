import { Card } from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import {
  formatYearMonth,
  withAge,
  type DefinedContributionMonth,
} from '../../domain/index.mjs';
import { input$, result$, updateSection } from '../../store/index.mjs';
import { formatYen } from '../../utils/index.mjs';
import {
  CheckboxField,
  NumberField,
  OutputField,
  TextField,
} from '../fields/index.mjs';
import {
  GranularityToggle,
  ResultTable,
  type Granularity,
  type ResultColumn,
} from '../tables/index.mjs';

/** `確定拠出型年金` シート: 評価額の推移と一括受給額の税金。 */
export const DefinedContributionTab = (): JSX.Element => {
  const [granularity$, setGranularity] = createState<Granularity>('year');

  return (
    <div class={constant('tab-body')}>
      <Card>
        <h2 class={constant('bp6-heading')}>{constant('入力')}</h2>
        <p class={constant('bp6-text-muted note')}>
          {constant(
            '掛金は「年収」のタブの企業型 DC と iDeCo の合計で、60 歳か退職年齢の早いほうになる月から 0。運用利回りは現役時代のもの。一括受給の年齢は「概要」のタブで決める。',
          )}
        </p>
        <div class={constant('form')}>
          <NumberField
            label="開始時点の評価額（円）"
            value={view(input$, (i) => i.definedContribution.initialValue)}
            onChange={(initialValue) => {
              updateSection('definedContribution', (d) => ({
                ...d,
                initialValue,
              }));
            }}
          />
          <TextField
            label="加入した年月"
            type="month"
            value={view(input$, (i) => i.definedContribution.joinedAt)}
            onChange={(joinedAt) => {
              updateSection('definedContribution', (d) => ({ ...d, joinedAt }));
            }}
          />
          <NumberField
            label="一括受給の前に 60〜64 歳で毎年受け取る額（円）"
            value={view(
              input$,
              (i) => i.definedContribution.installmentAge60To64,
            )}
            onChange={(installmentAge60To64) => {
              updateSection('definedContribution', (d) => ({
                ...d,
                installmentAge60To64,
              }));
            }}
          />
          <NumberField
            label="一括受給の前に 65〜68 歳で毎年受け取る額（円）"
            value={view(
              input$,
              (i) => i.definedContribution.installmentAge65To68,
            )}
            onChange={(installmentAge65To68) => {
              updateSection('definedContribution', (d) => ({
                ...d,
                installmentAge65To68,
              }));
            }}
          />
          <NumberField
            label="一括受給額（税引き後）のうち積立 NISA に入れる額（円）"
            value={view(input$, (i) => i.definedContribution.lumpSumToNisa)}
            onChange={(lumpSumToNisa) => {
              updateSection('definedContribution', (d) => ({
                ...d,
                lumpSumToNisa,
              }));
            }}
          />
          <CheckboxField
            label="一括受給額の残りを投信（課税枠）に入れる"
            value={view(
              input$,
              (i) => i.definedContribution.lumpSumRestToTaxable,
            )}
            onChange={(lumpSumRestToTaxable) => {
              updateSection('definedContribution', (d) => ({
                ...d,
                lumpSumRestToTaxable,
              }));
            }}
          />
        </div>
      </Card>
      <Card>
        <h2 class={constant('bp6-heading')}>{constant('一括受給')}</h2>
        <div class={constant('form')}>
          <OutputField
            label="一括受取年月"
            value={view(result$, (r) =>
              formatYearMonth(r.definedContribution.lumpSumMonth),
            )}
          />
          <OutputField
            label="一括受取額（税引き前）"
            value={view(result$, (r) =>
              formatYen(r.definedContribution.lumpSum.gross),
            )}
          />
          <OutputField
            label="勤続（加入）年数"
            value={view(
              result$,
              (r) => `${r.definedContribution.lumpSum.years} 年`,
            )}
          />
          <OutputField
            label="退職所得控除"
            value={view(result$, (r) =>
              formatYen(r.definedContribution.lumpSum.deduction),
            )}
          />
          <OutputField
            label="課税退職所得金額"
            value={view(result$, (r) =>
              formatYen(r.definedContribution.lumpSum.taxable),
            )}
          />
          <OutputField
            label="所得税・住民税"
            value={view(result$, (r) =>
              formatYen(r.definedContribution.lumpSum.tax),
            )}
          />
          <OutputField
            label="一括受取額（税引き後）"
            e2e="dc-lump-sum"
            value={view(result$, (r) =>
              formatYen(r.definedContribution.lumpSum.afterTax),
            )}
          />
        </div>
      </Card>
      <Card>
        <div class={constant('section-header')}>
          <h2 class={constant('bp6-heading')}>{constant('評価額の推移')}</h2>
          <GranularityToggle
            granularity$={granularity$}
            setGranularity={setGranularity}
          />
        </div>
        <ResultTable
          caption="確定拠出年金（円）"
          rows={view(result$, (r) =>
            withAge(r.definedContribution.months, r.birth),
          )}
          columns={columns}
          monthOf={(r) => r.month}
          ageOf={(r) => r.age}
          granularity={granularity$}
        />
      </Card>
    </div>
  );
};

const columns: readonly ResultColumn<DefinedContributionMonth>[] = [
  { header: '掛金', value: (r) => r.contribution, aggregate: 'sum' },
  { header: '取り崩し額', value: (r) => r.withdrawal, aggregate: 'sum' },
  { header: '受取額（課税後）', value: (r) => r.received, aggregate: 'sum' },
  { header: '評価額', value: (r) => r.value, aggregate: 'last' },
] as const;
