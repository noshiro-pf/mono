import * as t from 'ts-fortress';

/**
 * シミュレーションの入力値。スプレッドシートで手入力していたセルに当たり、
 * 画面で編集できるのはここにある値だけ。計算で導出される値は持たない。
 *
 * 年月は `YYYY-MM` の文字列（`<input type="month">` の値）で持つ。
 * 既定値はリポジトリが公開なので、実在の人の値ではなく一般的な例にしている。
 * 保存した値を読み込むときは `SimulationInput.fill` で欠けた値を既定値で補う。
 */

const yearMonth = (defaultValue: string): t.Type<string> =>
  t.string(defaultValue);

/** 年収の推移の 1 行（`年収` シートの左の表）。 */
const SalaryHistoryEntry = t.record({
  id: t.number(0),
  /** この行の値が適用され始める年月 */
  start: yearMonth('2026-01'),
  /** 年収（賞与を除く、企業型 DC の掛金を含む）（円） */
  annualBase: t.number(0),
  /** 企業型 DC の掛金（円 / 月） */
  companyDcMonthly: t.number(0),
  /** iDeCo の掛金（円 / 月） */
  idecoMonthly: t.number(0),
  /** 賞与（額面、円 / 年、毎年 1 月に支給） */
  annualBonus: t.number(0),
});

export type SalaryHistoryEntry = t.TypeOf<typeof SalaryHistoryEntry>;

/** 日常生活費の 1 項目（`日常生活費` シート）。 */
const LivingCostItem = t.record({
  id: t.number(0),
  category: t.string(''),
  name: t.string(''),
  /** 月額（円） */
  monthly: t.number(0),
  note: t.string(''),
});

export type LivingCostItem = t.TypeOf<typeof LivingCostItem>;

/** 何年かおきに出ていく支出（`収支` シートの家電買い替え・旅行など）。 */
const PeriodicExpense = t.record({
  id: t.number(0),
  name: t.string(''),
  /** 1 回の金額（円） */
  amount: t.number(0),
  /** 間隔（年） */
  intervalYears: t.number(1),
  /** 初回の年月 */
  first: yearMonth('2027-01'),
  /** この年月より前まで */
  until: yearMonth('2090-01'),
});

export type PeriodicExpense = t.TypeOf<typeof PeriodicExpense>;

/** 特定の月の一回きりの収入・支出・投資・取り崩し。 */
const OneOffAmount = t.record({
  id: t.number(0),
  name: t.string(''),
  month: yearMonth('2026-01'),
  /** 金額（円） */
  amount: t.number(0),
});

export type OneOffAmount = t.TypeOf<typeof OneOffAmount>;

/** ある年月から次の行の年月まで毎月続く金額（定期投資額・定期取り崩し額）。 */
const MonthlyAmountFrom = t.record({
  id: t.number(0),
  start: yearMonth('2026-01'),
  /** 毎月の金額（円） */
  amount: t.number(0),
});

export type MonthlyAmountFrom = t.TypeOf<typeof MonthlyAmountFrom>;

/** 積立 NISA・投信（課税枠）の口座ごとの入力値。 */
const investmentAccountInput = (
  defaultRegularContributions: readonly MonthlyAmountFrom[],
): t.Type<InvestmentAccountInput> =>
  t.record({
    /** シミュレーション開始時点の評価額（円） */
    initialValue: t.number(0),
    /** シミュレーション開始時点の元金（円） */
    initialPrincipal: t.number(0),
    /** シミュレーション開始時点で使っている生涯投資枠（円、NISA のみ） */
    initialUsedQuota: t.number(0),
    regularContributions: t.array(MonthlyAmountFrom, {
      defaultValue: defaultRegularContributions,
    }),
    oneOffContributions: t.array(OneOffAmount),
    regularWithdrawals: t.array(MonthlyAmountFrom),
    oneOffWithdrawals: t.array(OneOffAmount),
  });

export type InvestmentAccountInput = Readonly<{
  initialValue: number;
  initialPrincipal: number;
  initialUsedQuota: number;
  regularContributions: readonly MonthlyAmountFrom[];
  oneOffContributions: readonly OneOffAmount[];
  regularWithdrawals: readonly MonthlyAmountFrom[];
  oneOffWithdrawals: readonly OneOffAmount[];
}>;

export const housingTypeIds = [
  'long-life',
  'zeh',
  'energy-efficient',
  'other',
] as const;

export const housingConditionIds = ['new', 'used'] as const;

export const SimulationInput = t.record({
  profile: t.record({
    /** 生年月（誕生月の 1 日に年齢が上がるものとして扱う） */
    birth: yearMonth('1990-04'),
    /** シミュレーションを始める年月 */
    start: yearMonth('2026-01'),
    /** 何歳まで計算するか */
    endAge: t.number(100),
  }),

  /** `収支グラフ` シートの前提 */
  assumptions: t.record({
    /** 何歳まで働くか（この年齢になる月まで給与が出る） */
    retirementAge: t.number(65),
    /** 年金を何歳から受給するか（60〜75） */
    pensionStartAge: t.number(65),
    /** 確定拠出年金を何歳に一括受給するか */
    dcLumpSumAge: t.number(60),
    /** 生活費の物価上昇率（年率） */
    livingCostInflationRate: t.number(0.01),
    /** 運用利回り（現役時代、年率） */
    yieldWorking: t.number(0.03),
    /** 運用利回り（老後、年率） */
    yieldRetired: t.number(0.01),
    /** 何歳から老後の運用利回りにするか */
    yieldSwitchAge: t.number(70),
    /** シミュレーション開始時点の現預金（円） */
    initialCash: t.number(3_000_000),
    /** 現預金がこの額を下回る月が無いかを調べる（円） */
    cashThreshold: t.number(2_000_000),
    /** 上の判定をこの年月から始める */
    cashThresholdCheckFrom: yearMonth('2027-01'),
  }),

  salaryHistory: t.array(SalaryHistoryEntry, {
    defaultValue: [
      {
        id: 1,
        start: '2020-04',
        annualBase: 4_800_000,
        companyDcMonthly: 0,
        idecoMonthly: 0,
        annualBonus: 1_000_000,
      },
      {
        id: 2,
        start: '2036-01',
        annualBase: 6_000_000,
        companyDcMonthly: 0,
        idecoMonthly: 0,
        annualBonus: 1_200_000,
      },
    ],
  }),

  livingCosts: t.array(LivingCostItem, {
    defaultValue: [
      {
        id: 1,
        category: '光熱費',
        name: '電気・ガス・水道',
        monthly: 15_000,
        note: '',
      },
      { id: 2, category: '通信費', name: '', monthly: 8000, note: '' },
      { id: 3, category: '食費', name: '', monthly: 50_000, note: '' },
      { id: 4, category: '日用品', name: '', monthly: 10_000, note: '' },
      { id: 5, category: '交際費', name: '', monthly: 20_000, note: '' },
      { id: 6, category: '医療費', name: '', monthly: 5000, note: '' },
      { id: 7, category: 'その他', name: '雑費', monthly: 10_000, note: '' },
    ],
  }),

  /** 住宅費（賃貸） */
  rent: t.record({
    monthly: t.number(80_000),
    /** この年月より前まで家賃を払う */
    until: yearMonth('2030-01'),
  }),

  /** `住宅ローン` シートの入力 */
  housingLoan: t.record({
    /** 借入額（円）。0 なら住宅ローンなし */
    principal: t.number(30_000_000),
    /** 返済年数 */
    termYears: t.number(35),
    /** 返済開始月 */
    start: yearMonth('2030-01'),
    /** 初期金利（年率） */
    initialRate: t.number(0.005),
    /** 5 年ごとの金利の上昇率 */
    rateIncreasePer5Years: t.number(0.0025),
    /** 金利の上限（年率） */
    maxRate: t.number(0.02),
    houseType: t.enumType(housingTypeIds, { defaultValue: 'zeh' }),
    houseCondition: t.enumType(housingConditionIds, { defaultValue: 'new' }),
    /** 子育て世帯・若者夫婦世帯か */
    childRearing: t.boolean(false),
  }),

  periodicExpenses: t.array(PeriodicExpense, {
    defaultValue: [
      {
        id: 1,
        name: '家電買い替え',
        amount: 100_000,
        intervalYears: 5,
        first: '2027-01',
        until: '2090-01',
      },
      {
        id: 2,
        name: '旅行',
        amount: 150_000,
        intervalYears: 1,
        first: '2027-01',
        until: '2070-01',
      },
    ],
  }),

  oneOffIncomes: t.array(OneOffAmount),

  oneOffExpenses: t.array(OneOffAmount),

  /** 旧つみたて NISA の預り（売却した月に収入になる） */
  oldNisa: t.record({
    /** 購入額（円） */
    amount: t.number(0),
    purchasedAt: yearMonth('2023-01'),
    /** 売却する年月 */
    sellAt: yearMonth('2042-12'),
  }),

  nisa: investmentAccountInput([
    { id: 1, start: '2026-01', amount: 30_000 },
    { id: 2, start: '2055-04', amount: 0 },
  ]),

  taxableInvestment: investmentAccountInput([]),

  /** `確定拠出型年金` シートの入力 */
  definedContribution: t.record({
    /** シミュレーション開始時点の評価額（円） */
    initialValue: t.number(0),
    /** 加入した年月（退職所得控除の勤続年数に使う） */
    joinedAt: yearMonth('2026-01'),
    /** 一括受給の前に 60〜64 歳で毎年受け取る額（円） */
    installmentAge60To64: t.number(600_000),
    /** 一括受給の前に 65〜68 歳で毎年受け取る額（円） */
    installmentAge65To68: t.number(1_100_000),
    /** 一括受給額（税引き後）のうち積立 NISA に入れる額（円） */
    lumpSumToNisa: t.number(0),
    /** 一括受給額の残りを投信（課税枠）に入れるか */
    lumpSumRestToTaxable: t.boolean(false),
  }),

  /** `年金受給額` シートの入力 */
  pension: t.record({
    /** 基礎年金の加入月数 */
    basicPensionMonths: t.number(480),
  }),
});

export type SimulationInput = t.TypeOf<typeof SimulationInput>;

export const defaultSimulationInput: SimulationInput =
  SimulationInput.defaultValue;
