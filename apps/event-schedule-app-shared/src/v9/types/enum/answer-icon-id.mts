import * as t from 'ts-fortress';

export const AnswerIconId = t.enumType(['poor', 'fair', 'good']);

export const AnswerIconIdWithNone = t.enumType([
  'none',
  'poor',
  'fair',
  'good',
]);

export type AnswerIconId = t.TypeOf<typeof AnswerIconId>;

export type AnswerIconIdWithNone = t.TypeOf<typeof AnswerIconIdWithNone>;
