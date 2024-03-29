import * as t from '@noshiro/io-ts';

export const answerIconIdTypeDef = t.enumType({
  defaultValue: 'poor',
  values: ['fair', 'good', 'poor'],
} as const);

export const answerIconIdWithNoneTypeDef = t.enumType({
  defaultValue: 'none',
  values: ['fair', 'good', 'poor', 'none'],
} as const);

export type AnswerIconId = t.TypeOf<typeof answerIconIdTypeDef>;

export type AnswerIconIdWithNone = t.TypeOf<typeof answerIconIdWithNoneTypeDef>;

export const isAnswerIconId = answerIconIdTypeDef.is;

export const isAnswerIconIdWithNone = answerIconIdWithNoneTypeDef.is;
