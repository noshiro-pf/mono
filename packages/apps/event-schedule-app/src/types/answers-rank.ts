import * as t from '@noshiro/io-ts';

const answerRankTypeDef = t.uintRange({
  defaultValue: 3,
  start: 1,
  end: 11,
  typeName: 'AnswerRank',
});

export type AnswerRank = t.TypeOf<typeof answerRankTypeDef>;

export const isAnswerRank = answerRankTypeDef.is;
