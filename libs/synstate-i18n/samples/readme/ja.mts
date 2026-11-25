import { plural, type TranslationOf } from 'synstate-i18n';
import type { en } from './en.mjs';

const p = plural('ja');

export const ja = {
  title: '日程調整',
  greeting: 'こんにちは、{name}さん',
  answers: (params) => p(params.count, { other: '# 件の回答' }),
  deadline: { label: '{date} までに回答' },
} as const satisfies TranslationOf<typeof en>;
