import * as t from '@noshiro/io-ts';

export const AnswerIconId = t.enumType(['poor', 'fair', 'good']);

export const AnswerIconIdWithNone = t.enumType([
  'none',
  'poor',
  'fair',
  'good',
]);

export type AnswerIconId = t.TypeOf<typeof AnswerIconId>;

export type AnswerIconIdWithNone = t.TypeOf<typeof AnswerIconIdWithNone>;
