import { createState } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import {
  CashFlowTab,
  DataTab,
  DefinedContributionTab,
  HousingLoanTab,
  InvestmentTab,
  LivingCostTab,
  OverviewTab,
  PensionTab,
  SalaryTab,
} from '../tabs/index.mjs';

/**
 * 開いているプランの、スプレッドシートのシートごとのタブ。表示しているタブ
 * だけを組み立てるので、表示していないタブの表は計算し直さない。
 */
export const Workspace = (): JSX.Element => {
  const [tab$, setTab] = createState<TabId>('overview');

  return (
    <>
      <nav class={constant('tabs')} aria-label={constant('シート')}>
        {tabs.map((tab) => (
          <button
            type={constant('button')}
            data-e2e={constant(`tab-${tab.id}`)}
            aria-current={view(tab$, (t) =>
              t === tab.id ? 'page' : undefined,
            )}
            onClick={() => {
              setTab(tab.id);
            }}
          >
            {constant(tab.label)}
          </button>
        ))}
      </nav>
      {tabs.map((tab) => (
        <If cond={view(tab$, (t) => t === tab.id)} then={tab.render()} />
      ))}
    </>
  );
};

type TabId = (typeof tabs)[number]['id'];

const tabs = [
  { id: 'overview', label: '概要', render: () => <OverviewTab /> },
  { id: 'cash-flow', label: '収支', render: () => <CashFlowTab /> },
  { id: 'salary', label: '年収', render: () => <SalaryTab /> },
  { id: 'pension', label: '年金受給額', render: () => <PensionTab /> },
  {
    id: 'nisa',
    label: '積立 NISA',
    render: () => <InvestmentTab account={'nisa'} />,
  },
  {
    id: 'taxable',
    label: '投信（課税枠）',
    render: () => <InvestmentTab account={'taxableInvestment'} />,
  },
  { id: 'dc', label: '確定拠出年金', render: () => <DefinedContributionTab /> },
  { id: 'housing-loan', label: '住宅ローン', render: () => <HousingLoanTab /> },
  { id: 'living-cost', label: '日常生活費', render: () => <LivingCostTab /> },
  { id: 'data', label: '保存・読み込み', render: () => <DataTab /> },
] as const;
