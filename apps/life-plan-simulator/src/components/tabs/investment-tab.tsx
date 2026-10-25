import { createState } from 'synstate';
import { constant, view, type Bindable, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import {
  withAge,
  type InvestmentAccountInput,
  type InvestmentAccountMonth,
  type MonthlyAmountFrom,
  type OneOffAmount,
} from '../../domain/index.mjs';
import { input$, result$, updateSection } from '../../store/index.mjs';
import { NumberField } from '../fields/index.mjs';
import {
  EditableTable,
  GranularityToggle,
  ResultTable,
  type EditableColumn,
  type Granularity,
  type ResultColumn,
} from '../tables/index.mjs';

/** `積立NISA` / `投信（課税枠）` シート: 投資・取り崩しの予定と評価額。 */
export const InvestmentTab = ({
  account,
}: Readonly<{ account: 'nisa' | 'taxableInvestment' }>): JSX.Element => {
  const [granularity$, setGranularity] = createState<Granularity>('year');

  const isNisa = account === 'nisa';

  const update = (
    fn: (a: InvestmentAccountInput) => InvestmentAccountInput,
  ): void => {
    updateSection(account, fn);
  };

  const listOf = <K extends ListKey>(key: K): EditableListProps<K> =>
    ({
      items: view(input$, (i) => i[account][key]),
      update: (fn) => {
        update((a) => ({ ...a, [key]: fn(a[key]) }));
      },
    }) as const;

  return (
    <div class={constant('tab-body')}>
      <section>
        <h2>{constant('開始時点の状態')}</h2>
        <div class={constant('form')}>
          <NumberField
            label="評価額（円）"
            value={view(input$, (i) => i[account].initialValue)}
            onChange={(initialValue) => {
              update((a) => ({ ...a, initialValue }));
            }}
          />
          <NumberField
            label="元金（円）"
            value={view(input$, (i) => i[account].initialPrincipal)}
            onChange={(initialPrincipal) => {
              update((a) => ({ ...a, initialPrincipal }));
            }}
          />
          {isNisa ? (
            <NumberField
              label="生涯投資枠の利用額（円）"
              value={view(input$, (i) => i[account].initialUsedQuota)}
              onChange={(initialUsedQuota) => {
                update((a) => ({ ...a, initialUsedQuota }));
              }}
            />
          ) : (
            []
          )}
        </div>
        <p class={constant('note')}>
          {constant(
            '開始月の投資の前の値。確定拠出年金の一括受給額をこの口座に入れる設定は「確定拠出年金」のタブにある。',
          )}
        </p>
      </section>
      <section>
        <h2>{constant('定期投資額')}</h2>
        <EditableTable
          caption="定期投資額"
          {...listOf('regularContributions')}
          columns={stepColumns}
          createItem={newStep}
        />
      </section>
      <section>
        <h2>{constant('単発投資額')}</h2>
        <EditableTable
          caption="単発投資額"
          {...listOf('oneOffContributions')}
          columns={oneOffColumns}
          createItem={newOneOff}
        />
      </section>
      <section>
        <h2>{constant('定期取り崩し額')}</h2>
        <EditableTable
          caption="定期取り崩し額"
          {...listOf('regularWithdrawals')}
          columns={stepColumns}
          createItem={newStep}
        />
      </section>
      <section>
        <h2>{constant('単発取り崩し額')}</h2>
        <EditableTable
          caption="単発取り崩し額"
          {...listOf('oneOffWithdrawals')}
          columns={oneOffColumns}
          createItem={newOneOff}
        />
      </section>
      <section>
        <div class={constant('section-header')}>
          <h2>{constant('評価額の推移')}</h2>
          <GranularityToggle
            granularity$={granularity$}
            setGranularity={setGranularity}
          />
        </div>
        <ResultTable
          caption="評価額の推移（円）"
          rows={view(result$, (r) => withAge(r[account], r.birth))}
          columns={isNisa ? nisaColumns : taxableColumns}
          monthOf={(r) => r.month}
          ageOf={(r) => r.age}
          granularity={granularity$}
        />
      </section>
    </div>
  );
};

type ListKey =
  | 'oneOffContributions'
  | 'oneOffWithdrawals'
  | 'regularContributions'
  | 'regularWithdrawals';

type EditableListProps<K extends ListKey> = Readonly<{
  items: Bindable<InvestmentAccountInput[K]>;
  update: (
    fn: (items: InvestmentAccountInput[K]) => InvestmentAccountInput[K],
  ) => void;
}>;

const stepColumns: readonly EditableColumn<MonthlyAmountFrom>[] = [
  {
    kind: 'month',
    header: '開始',
    get: (r) => r.start,
    set: (r, start) => ({ ...r, start }),
  },
  {
    kind: 'number',
    header: '毎月の金額（円）',
    get: (r) => r.amount,
    set: (r, amount) => ({ ...r, amount }),
  },
] as const;

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

const newStep = (id: number): MonthlyAmountFrom =>
  ({
    id,
    start: input$.getSnapshot().value.profile.start,
    amount: 0,
  }) as const;

const newOneOff = (id: number): OneOffAmount =>
  ({
    id,
    name: '',
    month: input$.getSnapshot().value.profile.start,
    amount: 0,
  }) as const;

const commonColumns: readonly ResultColumn<InvestmentAccountMonth>[] = [
  { header: '投資額', value: (r) => r.contribution, aggregate: 'sum' },
  { header: '取り崩し額', value: (r) => r.withdrawal, aggregate: 'sum' },
  { header: '評価額', value: (r) => r.value, aggregate: 'last' },
  { header: '元金総額', value: (r) => r.principal, aggregate: 'last' },
  {
    header: '利益の割合',
    value: (r) => r.profitRatio,
    aggregate: 'last',
    format: 'percent',
  },
  {
    header: '取崩額に含まれる利益額',
    value: (r) => r.profitInWithdrawal,
    aggregate: 'sum',
  },
  {
    header: '取崩額に含まれる元金額',
    value: (r) => r.principalInWithdrawal,
    aggregate: 'sum',
  },
] as const;

const nisaColumns: readonly ResultColumn<InvestmentAccountMonth>[] =
  Arr.toPushed(commonColumns, {
    header: '生涯投資枠の利用額',
    value: (r) => r.usedQuota,
    aggregate: 'last',
  });

const taxableColumns: readonly ResultColumn<InvestmentAccountMonth>[] =
  Arr.toPushed(commonColumns, {
    header: '受取額（課税後）',
    value: (r) => r.received,
    aggregate: 'sum',
  });
