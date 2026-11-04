/**
 * The days of the week, indexed the way `Date.prototype.getDay` numbers them —
 * Sunday first.
 *
 * Ported from the `@noshiro/ts-utils-additional` this app used before the
 * monorepo consolidation; `ts-data-forge` has no successor for it.
 */
export const daysOfWeekList = {
  en: [
    { name: 'Sunday', abbr: 'Su' },
    { name: 'Monday', abbr: 'Mo' },
    { name: 'Tuesday', abbr: 'Tu' },
    { name: 'Wednesday', abbr: 'We' },
    { name: 'Thursday', abbr: 'Th' },
    { name: 'Friday', abbr: 'Fr' },
    { name: 'Saturday', abbr: 'Sa' },
  ],
  jp: [
    { name: '日曜日', abbr: '日' },
    { name: '月曜日', abbr: '月' },
    { name: '火曜日', abbr: '火' },
    { name: '水曜日', abbr: '水' },
    { name: '木曜日', abbr: '木' },
    { name: '金曜日', abbr: '金' },
    { name: '土曜日', abbr: '土' },
  ],
} as const;
