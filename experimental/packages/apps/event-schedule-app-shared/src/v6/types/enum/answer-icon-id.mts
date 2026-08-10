export type AnswerIconId = 'fair' | 'good' | 'poor';
export type AnswerIconIdWithNone = AnswerIconId | 'none';

export const isAnswerIconId = (a: unknown): a is AnswerIconId =>
  a === 'fair' || a === 'good' || a === 'poor';

export const isAnswerIconIdWithNone = (a: unknown): a is AnswerIconIdWithNone =>
  a === 'fair' || a === 'good' || a === 'poor' || a === 'none';
