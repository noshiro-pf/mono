import type { ReadonlyRecord } from 'ts-type-forge';
import type { LocalizedText } from '../constants.mjs';
import { requestMs } from './search-view.mjs';

export const searchViewText = {
  query: { en: 'Query', ja: 'クエリ' },
  order: {
    en: 'Preact Signals: the view effect is created',
    ja: 'Preact Signals: view の effect を作る順番',
  },
  viewFirst: {
    en: 'before the search effect',
    ja: '検索の effect より前',
  },
  viewAfter: {
    en: 'after the search effect',
    ja: '検索の effect より後',
  },
  preactTitle: {
    en: 'Preact Signals (effect writes a signal)',
    ja: 'Preact Signals（effect が signal に書く）',
  },
  synstateTitle: {
    en: 'SynState (switchMap)',
    ja: 'SynState（switchMap）',
  },
  glitch: {
    en: 'new query, old list',
    ja: '新しいクエリと古いリスト',
  },
  reset: { en: 'Reset', ja: 'リセット' },
  caption: {
    en: `Each row is one run of the view, newest first. A request answers ${requestMs.toString()} ms after it is sent.`,
    ja: `1 行が view の 1 回の実行で、新しいものが上です。リクエストは送ってから ${requestMs.toString()} ms 後に返ります。`,
  },
} as const satisfies ReadonlyRecord<string, LocalizedText>;

export const eventCountText = {
  clickA: { en: 'Click A', ja: 'A をクリック' },
  clickBC: {
    en: 'Click B and C in one batch',
    ja: 'B と C を 1 つの batch でクリック',
  },
  reset: { en: 'Reset', ja: 'リセット' },
  clicks: { en: 'Clicks made', ja: 'クリックした回数' },
  preact: {
    en: 'Preact Signals (effect as scan)',
    ja: 'Preact Signals（effect で scan）',
  },
  synstate: { en: 'SynState (scan)', ja: 'SynState（scan）' },
  lost: { en: 'fewer than clicked', ja: 'クリックより少ない' },
  caption: {
    en: 'Each click sends the clicked item’s id. Click A twice to see an equal value dropped.',
    ja: 'クリックはクリックした項目の id を送ります。A を 2 回押すと同値の書き込みが捨てられます。',
  },
} as const satisfies ReadonlyRecord<string, LocalizedText>;
