import type { UserId } from './types';
import { isUserId } from './types';

export type AnswerOfDate = Readonly<{
  good: ISet<UserId>;
  fair: ISet<UserId>;
  poor: ISet<UserId>;
}>;

export type AnswerOfDateJson = DeepReadonly<{
  good: string[];
  fair: string[];
  poor: string[];
}>;

assertType<TypeExtends<AnswerOfDateJson, ReadonlyJSONType>>();

export const answerOfDateDefaultValue: AnswerOfDate = {
  good: ISet.new<UserId>([]),
  fair: ISet.new<UserId>([]),
  poor: ISet.new<UserId>([]),
} as const;

const d = answerOfDateDefaultValue;

export const fillAnswerOfDate = (a?: unknown): AnswerOfDate =>
  !isRecord(a)
    ? d
    : {
        good:
          IRecord.hasKeyValue(a, 'good', IList.isArray) &&
          a.good.every(isUserId)
            ? ISet.new(a.good)
            : d.good,

        fair:
          IRecord.hasKeyValue(a, 'fair', IList.isArray) &&
          a.fair.every(isUserId)
            ? ISet.new(a.fair)
            : d.fair,

        poor:
          IRecord.hasKeyValue(a, 'poor', IList.isArray) &&
          a.poor.every(isUserId)
            ? ISet.new(a.poor)
            : d.poor,
      };

export const answerOfDateToJson = (a: AnswerOfDate): AnswerOfDateJson => ({
  good: a.good.toArray(),
  fair: a.fair.toArray(),
  poor: a.poor.toArray(),
});
