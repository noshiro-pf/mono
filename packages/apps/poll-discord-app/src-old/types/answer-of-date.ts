import * as t from '@noshiro/io-ts';
import type { UserId } from './types';

export const answerOfDateJsonTypeDef = t.record({
  good: t.array({ elementType: t.string(''), defaultValue: [] }),
  fair: t.array({ elementType: t.string(''), defaultValue: [] }),
  poor: t.array({ elementType: t.string(''), defaultValue: [] }),
});

export type AnswerOfDateJson = t.TypeOf<typeof answerOfDateJsonTypeDef>;

assertType<TypeExtends<AnswerOfDateJson, ReadonlyJSONType>>();

export type AnswerOfDate = Readonly<{
  good: ISet<UserId>;
  fair: ISet<UserId>;
  poor: ISet<UserId>;
}>;

const answerOfDateFromJson = (a: AnswerOfDateJson): AnswerOfDate => ({
  good: ISet.new(a.good),
  fair: ISet.new(a.fair),
  poor: ISet.new(a.poor),
});

export const answerOfDateToJson = (a: AnswerOfDate): AnswerOfDateJson => ({
  good: a.good.toArray(),
  fair: a.fair.toArray(),
  poor: a.poor.toArray(),
});

export const answerOfDateDefaultValue: AnswerOfDate = answerOfDateFromJson(
  answerOfDateJsonTypeDef.defaultValue
);

export const fillAnswerOfDate = (a?: unknown): AnswerOfDate =>
  answerOfDateFromJson(answerOfDateJsonTypeDef.fill(a));
