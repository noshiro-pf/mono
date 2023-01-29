import { isUserId, type UserId } from './types';

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

expectType<AnswerOfDateJson, JSONType>('<=');

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
          Obj.hasKeyValue(a, 'good', Arr.isArray) && a.good.every(isUserId)
            ? ISet.new(a.good)
            : d.good,

        fair:
          Obj.hasKeyValue(a, 'fair', Arr.isArray) && a.fair.every(isUserId)
            ? ISet.new(a.fair)
            : d.fair,

        poor:
          Obj.hasKeyValue(a, 'poor', Arr.isArray) && a.poor.every(isUserId)
            ? ISet.new(a.poor)
            : d.poor,
      };

export const answerOfDateToJson = (a: AnswerOfDate): AnswerOfDateJson => ({
  good: a.good.toArray(),
  fair: a.fair.toArray(),
  poor: a.poor.toArray(),
});
