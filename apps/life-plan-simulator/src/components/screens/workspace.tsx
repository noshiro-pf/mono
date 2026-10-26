import { Tabs } from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
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
    <Tabs
      id={'sheets'}
      class={'workspace'}
      aria-label={constant('シート')}
      tabs={tabsWithE2e}
      selectedTabId={tab$}
      onChange={setTab}
    />
  );
};

type TabId = (typeof tabs)[number]['id'];

const tabs = [
  { id: 'overview', title: '概要', panel: <OverviewTab /> },
  { id: 'cash-flow', title: '収支', panel: <CashFlowTab /> },
  { id: 'salary', title: '年収', panel: <SalaryTab /> },
  { id: 'pension', title: '年金受給額', panel: <PensionTab /> },
  { id: 'nisa', title: '積立 NISA', panel: <InvestmentTab account={'nisa'} /> },
  {
    id: 'taxable',
    title: '投信（課税枠）',
    panel: <InvestmentTab account={'taxableInvestment'} />,
  },
  { id: 'dc', title: '確定拠出年金', panel: <DefinedContributionTab /> },
  { id: 'housing-loan', title: '住宅ローン', panel: <HousingLoanTab /> },
  { id: 'living-cost', title: '日常生活費', panel: <LivingCostTab /> },
  { id: 'data', title: '保存・読み込み', panel: <DataTab /> },
] as const;

/** e2e のテストが探す、各タブの見出しの `data-e2e`。 */
const tabsWithE2e = tabs.map((tab) => ({
  ...tab,
  'data-e2e': `tab-${tab.id}`,
}));
