import { defineRoutes } from 'synstate-router';
import type { ReadonlyRecord } from 'ts-type-forge';

/** The tabs in the order they are drawn. */
export const tabKeys = [
  'career',
  'biography',
  'skills',
  'products',
  'writings',
] as const;

type TabKey = (typeof tabKeys)[number];

// Both records are checked to have exactly the keys of `tabKeys`, so a tab
// added to one of the three lists and not the others fails `tsc`.

/** One page per tab, each at the tab's key: `/career/`, `/skills/` and so on. */
export const routes = defineRoutes({
  career: {},
  skills: {},
  biography: {},
  products: {},
  writings: {},
} satisfies ReadonlyRecord<TabKey, unknown>);

export const labels = {
  career: '経歴',
  biography: '自己紹介',
  skills: 'スキル',
  products: '製作物',
  writings: '執筆物',
} as const satisfies ReadonlyRecord<TabKey, string>;

export const labelList = tabKeys.map((k) => labels[k]);
