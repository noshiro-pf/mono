import { Card } from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant, derive, view, type JSX } from 'synstate-dom';
import {
  ageAt,
  deriveSalaryEntry,
  parseYearMonth,
  parseYearMonthOr,
  withAge,
  type SalaryHistoryEntry,
  type SalaryMonth,
} from '../../domain/index.mjs';
import { input$, result$, updateSection } from '../../store/index.mjs';
import { formatAmount } from '../../utils/index.mjs';
import {
  EditableTable,
  GranularityToggle,
  ResultTable,
  type EditableColumn,
  type Granularity,
  type ResultColumn,
} from '../tables/index.mjs';

/** `年収` シート: 年収の推移の入力と、月ごとの手取り額。 */
export const SalaryTab = (): JSX.Element => {
  const [granularity$, setGranularity] = createState<Granularity>('year');

  return (
    <div class={constant('tab-body')}>
      <Card>
        <h2 class={constant('bp6-heading')}>{constant('年収の推移')}</h2>
        <p class={constant('bp6-text-muted note')}>
          {constant(
            '各行の値は開始年月から次の行の開始年月の前まで続く。賞与は毎年 1 月に支給する。企業型 DC と iDeCo の掛金は確定拠出年金に積み立てる。',
          )}
        </p>
        <EditableTable
          caption="年収の推移"
          e2e="salary-history"
          items={view(input$, (i) => i.salaryHistory)}
          columns={historyColumns}
          update={(fn) => {
            updateSection('salaryHistory', fn);
          }}
          createItem={(id) => ({
            id,
            start: input$.getSnapshot().value.profile.start,
            annualBase: 0,
            companyDcMonthly: 0,
            idecoMonthly: 0,
            annualBonus: 0,
          })}
        />
      </Card>
      <Card>
        <div class={constant('section-header')}>
          <h2 class={constant('bp6-heading')}>
            {constant('税金・保険料と手取り')}
          </h2>
          <GranularityToggle
            granularity$={granularity$}
            setGranularity={setGranularity}
          />
        </div>
        <ResultTable
          caption="給与・賞与の手取り（円）"
          e2e="salary-table"
          rows={view(result$, (r) => withAge(r.salary, r.birth))}
          columns={salaryColumns}
          monthOf={(r) => r.month}
          ageOf={(r) => r.age}
          granularity={granularity$}
        />
      </Card>
    </div>
  );
};

const historyColumns: readonly EditableColumn<SalaryHistoryEntry>[] = [
  {
    kind: 'month',
    header: '開始',
    get: (r) => r.start,
    set: (r, start) => ({ ...r, start }),
  },
  {
    kind: 'derived',
    header: '年齢',
    render: (row$) =>
      derive([input$, row$], (input, row) => {
        const start = parseYearMonth(row.start);

        return start === undefined
          ? ''
          : String(ageAt(start, parseYearMonthOr(input.profile.birth, 0)));
      }),
  },
  {
    kind: 'number',
    header: '年収（賞与を除く、円）',
    get: (r) => r.annualBase,
    set: (r, annualBase) => ({ ...r, annualBase }),
  },
  {
    kind: 'number',
    header: '企業型 DC（円 / 月）',
    get: (r) => r.companyDcMonthly,
    set: (r, companyDcMonthly) => ({ ...r, companyDcMonthly }),
  },
  {
    kind: 'number',
    header: 'iDeCo（円 / 月）',
    get: (r) => r.idecoMonthly,
    set: (r, idecoMonthly) => ({ ...r, idecoMonthly }),
  },
  {
    kind: 'number',
    header: '賞与（額面、円 / 年）',
    get: (r) => r.annualBonus,
    set: (r, annualBonus) => ({ ...r, annualBonus }),
  },
  {
    kind: 'derived',
    header: '月収（額面）',
    render: (row$) =>
      view(row$, (r) => formatAmount(deriveSalaryEntry(r).monthlyGross)),
  },
  {
    kind: 'derived',
    header: '年収（賞与込み）',
    render: (row$) =>
      view(row$, (r) => formatAmount(deriveSalaryEntry(r).annualIncome)),
  },
] as const;

const sum = (
  header: string,
  value: (r: SalaryMonth) => number,
): ResultColumn<SalaryMonth> => ({ header, value, aggregate: 'sum' }) as const;

const salaryColumns: readonly ResultColumn<SalaryMonth>[] = [
  sum('月給（額面）', (r) => r.gross),
  sum('月給 - iDeCo', (r) => r.grossAfterIdeco),
  sum('健康保険料', (r) => r.healthInsurance),
  sum('厚生年金保険料', (r) => r.welfarePension),
  sum('雇用保険料', (r) => r.employmentInsurance),
  sum('所得税', (r) => r.incomeTax),
  sum('住民税（概算）', (r) => r.residentTax),
  sum('月給手取り額', (r) => r.net),
  sum('賞与（額面）', (r) => r.bonus),
  sum('賞与 健康保険料', (r) => r.bonusHealthInsurance),
  sum('賞与 厚生年金保険料', (r) => r.bonusWelfarePension),
  sum('賞与 雇用保険料', (r) => r.bonusEmploymentInsurance),
  sum('賞与 所得税', (r) => r.bonusIncomeTax),
  sum('賞与手取り額', (r) => r.bonusNet),
] as const;
