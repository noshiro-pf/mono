import * as t from '@noshiro/io-ts';
import { expectType, ISet, pipe } from '@noshiro/ts-utils';
import { userIdType, type UserId } from './branded-types';

export type AnswerOfDate = Readonly<{
  good: ISet<UserId>;
  fair: ISet<UserId>;
  poor: ISet<UserId>;
}>;

export const answerOfDateDefaultValue: AnswerOfDate = {
  good: ISet.new<UserId>([]),
  fair: ISet.new<UserId>([]),
  poor: ISet.new<UserId>([]),
} as const;

export const answerOfDateJsonType = t.record({
  good: t.array(userIdType),
  fair: t.array(userIdType),
  poor: t.array(userIdType),
});

export type AnswerOfDateJson = t.TypeOf<typeof answerOfDateJsonType>;

expectType<AnswerOfDateJson, JSONType>('<=');

export const answerOfDateFromJson = (p?: unknown): AnswerOfDate =>
  pipe(answerOfDateJsonType.fill(p)).chain((a) => ({
    good: ISet.new(a.good),
    fair: ISet.new(a.fair),
    poor: ISet.new(a.poor),
  })).value;

export const answerOfDateToJson = (a: AnswerOfDate): AnswerOfDateJson => ({
  good: a.good.toArray(),
  fair: a.fair.toArray(),
  poor: a.poor.toArray(),
});
