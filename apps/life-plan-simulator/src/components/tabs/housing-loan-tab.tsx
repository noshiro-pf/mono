import { createState } from 'synstate';
import { constant, derive, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { housingConditions, housingTypes } from '../../data/index.mjs';
import {
  ageAt,
  housingConditionIds,
  housingTypeIds,
  summarizeHousingLoan,
  type HousingLoanSimulation,
  type MonthIndex,
  type MonthlyPaymentResult,
} from '../../domain/index.mjs';
import { input$, result$, updateSection } from '../../store/index.mjs';
import { formatYen } from '../../utils/index.mjs';
import {
  CheckboxField,
  NumberField,
  OutputField,
  SelectField,
  TextField,
} from '../fields/index.mjs';
import {
  GranularityToggle,
  ResultTable,
  type Granularity,
  type ResultColumn,
} from '../tables/index.mjs';

/** `住宅ローン` シート: 返済スケジュールと住宅ローン控除。 */
export const HousingLoanTab = (): JSX.Element => {
  const [granularity$, setGranularity] = createState<Granularity>('year');

  const loan$ = view(result$, (r) => r.housingLoan);

  const summary = derive([loan$], (loan) =>
    summarizeHousingLoan(loan.schedule),
  );

  const rows = view(result$, (r) => toRows(r.housingLoan, r.birth));

  return (
    <div class={constant('tab-body')}>
      <section>
        <h2>{constant('借入')}</h2>
        <p class={constant('note')}>
          {constant(
            '元利均等返済。金利は初期金利から毎月少しずつ上がり、上限で頭打ちになる。借入額を 0 にすると住宅ローンなしで計算する。',
          )}
        </p>
        <div class={constant('form')}>
          <NumberField
            label="借入額（円）"
            e2e="loan-principal"
            value={view(input$, (i) => i.housingLoan.principal)}
            onChange={(principal) => {
              updateSection('housingLoan', (l) => ({ ...l, principal }));
            }}
          />
          <NumberField
            label="返済年数（年）"
            e2e="loan-term"
            value={view(input$, (i) => i.housingLoan.termYears)}
            onChange={(termYears) => {
              updateSection('housingLoan', (l) => ({ ...l, termYears }));
            }}
          />
          <TextField
            label="返済開始月"
            type="month"
            value={view(input$, (i) => i.housingLoan.start)}
            onChange={(start) => {
              updateSection('housingLoan', (l) => ({ ...l, start }));
            }}
          />
          <NumberField
            label="初期金利（年 %）"
            unit="percent"
            value={view(input$, (i) => i.housingLoan.initialRate)}
            onChange={(initialRate) => {
              updateSection('housingLoan', (l) => ({ ...l, initialRate }));
            }}
          />
          <NumberField
            label="5 年ごとの金利の上昇率（%）"
            unit="percent"
            value={view(input$, (i) => i.housingLoan.rateIncreasePer5Years)}
            onChange={(rateIncreasePer5Years) => {
              updateSection('housingLoan', (l) => ({
                ...l,
                rateIncreasePer5Years,
              }));
            }}
          />
          <NumberField
            label="上限金利（年 %）"
            unit="percent"
            value={view(input$, (i) => i.housingLoan.maxRate)}
            onChange={(maxRate) => {
              updateSection('housingLoan', (l) => ({ ...l, maxRate }));
            }}
          />
        </div>
      </section>
      <section>
        <h2>{constant('住宅ローン控除')}</h2>
        <div class={constant('form')}>
          <SelectField
            label="住宅の種別"
            options={housingTypeIds.map((id) => ({
              id,
              label: housingTypes.find((h) => h.id === id)?.label ?? id,
            }))}
            value={view(input$, (i) => i.housingLoan.houseType)}
            onChange={(houseType) => {
              updateSection('housingLoan', (l) => ({ ...l, houseType }));
            }}
          />
          <SelectField
            label="新築 / 中古"
            options={housingConditionIds.map((id) => ({
              id,
              label: housingConditions.find((c) => c.id === id)?.label ?? id,
            }))}
            value={view(input$, (i) => i.housingLoan.houseCondition)}
            onChange={(houseCondition) => {
              updateSection('housingLoan', (l) => ({ ...l, houseCondition }));
            }}
          />
          <CheckboxField
            label="子育て世帯・若者夫婦世帯"
            value={view(input$, (i) => i.housingLoan.childRearing)}
            onChange={(childRearing) => {
              updateSection('housingLoan', (l) => ({ ...l, childRearing }));
            }}
          />
        </div>
      </section>
      <section>
        <h2>{constant('返済額')}</h2>
        <div class={constant('form')}>
          <OutputField
            label="初回の返済額"
            e2e="loan-first-payment"
            value={derive([summary], (s) => formatYen(s.firstPayment))}
          />
          <OutputField
            label="最大の返済額"
            value={derive([summary], (s) => formatYen(s.maxPayment))}
          />
          <OutputField
            label="総返済額"
            e2e="loan-total-payment"
            value={derive([summary], (s) => formatYen(s.totalPayment))}
          />
          <OutputField
            label="住宅ローン控除の合計"
            value={derive([loan$], (l) =>
              formatYen(Arr.sum(l.deductions.map((d) => d.amount))),
            )}
          />
          <OutputField
            label="総返済額 - 住宅ローン控除"
            value={derive([summary, loan$], (s, l) =>
              formatYen(
                s.totalPayment - Arr.sum(l.deductions.map((d) => d.amount)),
              ),
            )}
          />
        </div>
      </section>
      <section>
        <div class={constant('section-header')}>
          <h2>{constant('返済スケジュール')}</h2>
          <GranularityToggle
            granularity$={granularity$}
            setGranularity={setGranularity}
          />
        </div>
        <ResultTable
          caption="返済スケジュール（円）"
          rows={rows}
          columns={columns}
          monthOf={(r) => r.month}
          ageOf={(r) => r.age}
          granularity={granularity$}
        />
      </section>
    </div>
  );
};

type Row = MonthlyPaymentResult &
  Readonly<{ month: MonthIndex; age: number; deduction: number }>;

const toRows = (
  loan: HousingLoanSimulation,
  birth: MonthIndex,
): readonly Row[] => {
  const deductions = new Map(loan.deductions.map((d) => [d.month, d.amount]));

  return loan.schedule.map((p) => {
    const month = loan.start + p.month - 1;

    return {
      ...p,
      month,
      age: ageAt(month, birth),
      deduction: deductions.get(month) ?? 0,
    };
  });
};

const columns: readonly ResultColumn<Row>[] = [
  {
    header: '適用金利',
    value: (r) => r.appliedAnnualRate,
    aggregate: 'last',
    format: 'percent',
  },
  { header: '返済額', value: (r) => r.paymentAmount, aggregate: 'sum' },
  { header: '残高', value: (r) => r.remainingBalance, aggregate: 'last' },
  { header: '住宅ローン控除', value: (r) => r.deduction, aggregate: 'sum' },
] as const;
