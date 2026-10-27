import { Card } from 'blueprint-synstate';
import { createState, type InitializedObservable } from 'synstate';
import { constant, derive, view, type Bindable, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type {
  CashFlowMonth,
  OneOffAmount,
  PeriodicExpense,
} from '../../domain/index.mjs';
import { input$, result$, updateSection } from '../../store/index.mjs';
import { formatAmount } from '../../utils/index.mjs';
import { NumberField, TextField } from '../fields/index.mjs';
import {
  EditableTable,
  GranularityToggle,
  ResultTable,
  type EditableColumn,
  type Granularity,
  type ResultColumn,
} from '../tables/index.mjs';

/** `収支` シート: 家賃・臨時の収支・何年かおきの支出の入力と、月ごとの収支。 */
export const CashFlowTab = (): JSX.Element => {
  const [granularity$, setGranularity] = createState<Granularity>('year');

  return (
    <div class={constant('tab-body')}>
      <Card>
        <h2 class={constant('bp6-heading')}>{constant('住宅費（賃貸）')}</h2>
        <div class={constant('form')}>
          <NumberField
            label="家賃（円 / 月）"
            value={view(input$, (i) => i.rent.monthly)}
            onChange={(monthly) => {
              updateSection('rent', (r) => ({ ...r, monthly }));
            }}
          />
          <TextField
            label="この年月より前まで払う"
            type="month"
            value={view(input$, (i) => i.rent.until)}
            onChange={(until) => {
              updateSection('rent', (r) => ({ ...r, until }));
            }}
          />
        </div>
      </Card>
      <Card>
        <h2 class={constant('bp6-heading')}>{constant('何年かおきの支出')}</h2>
        <EditableTable
          caption="何年かおきの支出"
          items={view(input$, (i) => i.periodicExpenses)}
          columns={periodicColumns}
          update={(fn) => {
            updateSection('periodicExpenses', fn);
          }}
          createItem={(id) => ({
            id,
            name: '',
            amount: 0,
            intervalYears: 1,
            first: input$.getSnapshot().value.profile.start,
            until: '2090-01',
          })}
        />
      </Card>
      <Card>
        <h2 class={constant('bp6-heading')}>{constant('臨時収入')}</h2>
        <EditableTable
          caption="臨時収入"
          items={view(input$, (i) => i.oneOffIncomes)}
          columns={oneOffColumns}
          update={(fn) => {
            updateSection('oneOffIncomes', fn);
          }}
          createItem={newOneOff}
        />
      </Card>
      <Card>
        <h2 class={constant('bp6-heading')}>{constant('臨時支出')}</h2>
        <EditableTable
          caption="臨時支出"
          items={view(input$, (i) => i.oneOffExpenses)}
          columns={oneOffColumns}
          update={(fn) => {
            updateSection('oneOffExpenses', fn);
          }}
          createItem={newOneOff}
        />
      </Card>
      <Card>
        <h2 class={constant('bp6-heading')}>
          {constant('旧つみたて NISA の預り')}
        </h2>
        <p class={constant('bp6-text-muted note')}>
          {constant(
            '購入から売却まで現役時代の運用利回りで増え、売却した月の収入になる。',
          )}
        </p>
        <div class={constant('form')}>
          <NumberField
            label="購入額（円）"
            value={view(input$, (i) => i.oldNisa.amount)}
            onChange={(amount) => {
              updateSection('oldNisa', (o) => ({ ...o, amount }));
            }}
          />
          <TextField
            label="購入した年月"
            type="month"
            value={view(input$, (i) => i.oldNisa.purchasedAt)}
            onChange={(purchasedAt) => {
              updateSection('oldNisa', (o) => ({ ...o, purchasedAt }));
            }}
          />
          <TextField
            label="売却する年月"
            type="month"
            value={view(input$, (i) => i.oldNisa.sellAt)}
            onChange={(sellAt) => {
              updateSection('oldNisa', (o) => ({ ...o, sellAt }));
            }}
          />
        </div>
      </Card>
      <Card>
        <div class={constant('section-header')}>
          <h2 class={constant('bp6-heading')}>{constant('収支')}</h2>
          <GranularityToggle
            granularity$={granularity$}
            setGranularity={setGranularity}
          />
        </div>
        <ResultTable
          caption="収支（円）"
          e2e="cash-flow-table"
          rows={view(result$, (r) => r.rows)}
          columns={cashFlowColumns}
          monthOf={(r) => r.month}
          ageOf={(r) => r.age}
          granularity={granularity$}
        />
      </Card>
    </div>
  );
};

const periodicColumns: readonly EditableColumn<PeriodicExpense>[] = [
  {
    kind: 'text',
    header: '項目',
    get: (r) => r.name,
    set: (r, name) => ({ ...r, name }),
  },
  {
    kind: 'number',
    header: '金額（円）',
    get: (r) => r.amount,
    set: (r, amount) => ({ ...r, amount }),
  },
  {
    kind: 'number',
    header: '何年おき',
    get: (r) => r.intervalYears,
    set: (r, intervalYears) => ({ ...r, intervalYears }),
  },
  {
    kind: 'month',
    header: '初回',
    get: (r) => r.first,
    set: (r, first) => ({ ...r, first }),
  },
  {
    kind: 'month',
    header: 'この年月より前まで',
    get: (r) => r.until,
    set: (r, until) => ({ ...r, until }),
  },
  {
    kind: 'derived',
    header: '回数（確認用）',
    render: (row$) =>
      periodicStat(row$, (amounts) =>
        amounts.filter((a) => a > 0).length.toString(),
      ),
  },
  {
    kind: 'derived',
    header: '総額（確認用）',
    render: (row$) =>
      periodicStat(row$, (amounts) => formatAmount(Arr.sum(amounts))),
  },
] as const;

/** 何年かおきの支出の 1 項目の、月ごとの金額から求めた値。 */
const periodicStat = (
  row$: InitializedObservable<PeriodicExpense>,
  fn: (amounts: readonly number[]) => string,
): Bindable<string> =>
  derive([input$, result$, row$], (input, result, row) => {
    const index = input.periodicExpenses.findIndex((e) => e.id === row.id);

    return fn(result.rows.map((m) => m.periodicItems[index] ?? 0));
  });

const oneOffColumns: readonly EditableColumn<OneOffAmount>[] = [
  {
    kind: 'text',
    header: '項目',
    get: (r) => r.name,
    set: (r, name) => ({ ...r, name }),
  },
  {
    kind: 'month',
    header: '年月',
    get: (r) => r.month,
    set: (r, month) => ({ ...r, month }),
  },
  {
    kind: 'number',
    header: '金額（円）',
    get: (r) => r.amount,
    set: (r, amount) => ({ ...r, amount }),
  },
] as const;

const newOneOff = (id: number): OneOffAmount =>
  ({
    id,
    name: '',
    month: input$.getSnapshot().value.profile.start,
    amount: 0,
  }) as const;

const sum = (
  header: string,
  value: (r: CashFlowMonth) => number,
): ResultColumn<CashFlowMonth> =>
  ({ header, value, aggregate: 'sum' }) as const;

const last = (
  header: string,
  value: (r: CashFlowMonth) => number,
): ResultColumn<CashFlowMonth> =>
  ({ header, value, aggregate: 'last' }) as const;

const cashFlowColumns: readonly ResultColumn<CashFlowMonth>[] = [
  sum('月給（手取り）', (r) => r.salaryNet),
  sum('賞与（手取り）', (r) => r.bonusNet),
  sum('臨時収入', (r) => r.oneOffIncome),
  sum('旧つみたて NISA', (r) => r.oldNisaSale),
  sum('年金（手取り）', (r) => r.pension),
  sum('確定拠出年金', (r) => r.definedContribution),
  sum('住宅ローン控除', (r) => r.housingLoanDeduction),
  sum('収入合計 (A)', (r) => r.totalIncome),
  sum('住宅費（賃貸）', (r) => r.rent),
  sum('住宅費（住宅ローン）', (r) => r.housingLoan),
  sum('日常生活費', (r) => r.livingCost),
  sum('何年かおきの支出', (r) => r.periodic),
  sum('臨時支出', (r) => r.oneOffExpense),
  sum('支出合計 (B)', (r) => r.totalExpense),
  sum('資産運用以外の収支 (A-B)', (r) => r.balanceExcludingInvestment),
  sum('積立 NISA 投資額 (C)', (r) => r.nisaContribution),
  sum('積立 NISA 取崩額 (D)', (r) => r.nisaWithdrawal),
  last('積立 NISA 資産額', (r) => r.nisaValue),
  sum('投信（課税枠）投資額 (E)', (r) => r.taxableContribution),
  sum('投信（課税枠）受取額 (F)', (r) => r.taxableReceived),
  last('投信（課税枠）資産額', (r) => r.taxableValue),
  last('確定拠出年金 資産額', (r) => r.definedContributionValue),
  sum('現預金の増減 (A-B-C+D-E+F)', (r) => r.cashChange),
  last('月末の現預金の額', (r) => r.cash),
] as const;
