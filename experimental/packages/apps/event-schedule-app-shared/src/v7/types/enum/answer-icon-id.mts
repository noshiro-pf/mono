import * as t from '@noshiro/io-ts';

export const answerIconIdTypeDef = t.enumType(['poor', 'fair', 'good']);

export const answerIconIdWithNoneTypeDef = t.enumType([
  'none',
  'poor',
  'fair',
  'good',
]);

export type AnswerIconId = t.TypeOf<typeof answerIconIdTypeDef>;

export type AnswerIconIdWithNone = t.TypeOf<typeof answerIconIdWithNoneTypeDef>;

export const isAnswerIconId = answerIconIdTypeDef.is;

export const isAnswerIconIdWithNone = answerIconIdWithNoneTypeDef.is;
