import { ISet, expectType, pipe } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { type JsonObject } from 'ts-type-forge';
import { userIdType, type UserId } from './branded-types.mjs';

export type AnswerOfDate = Readonly<{
  good: ISet<UserId>;
  fair: ISet<UserId>;
  poor: ISet<UserId>;
}>;

export const answerOfDateDefaultValue = {
  good: ISet.create<UserId>([]),
  fair: ISet.create<UserId>([]),
  poor: ISet.create<UserId>([]),
} as const satisfies AnswerOfDate;

export const answerOfDateJsonType = t.record({
  good: t.array(userIdType),
  fair: t.array(userIdType),
  poor: t.array(userIdType),
});

export type AnswerOfDateJson = t.TypeOf<typeof answerOfDateJsonType>;

expectType<AnswerOfDateJson, JsonObject>('<=');

export const answerOfDateFromJson = (p?: unknown): AnswerOfDate =>
  pipe(answerOfDateJsonType.fill(p)).map((a) => ({
    good: ISet.create(a.good),
    fair: ISet.create(a.fair),
    poor: ISet.create(a.poor),
  })).value;

export const answerOfDateToJson = (a: AnswerOfDate): AnswerOfDateJson =>
  ({
    good: a.good.toArray(),
    fair: a.fair.toArray(),
    poor: a.poor.toArray(),
  }) as const;
