import { expectType, ISet, mapOptional, pipe } from '@noshiro/ts-utils';
import { type UserId } from './types';

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

export type PartialAnswerOfDateJson = Partial<
  DeepReadonly<{
    good: UserId[];
    fair: UserId[];
    poor: UserId[];
  }>
>;

export const answerOfDateDefaultValue: AnswerOfDate = {
  good: ISet.new<UserId>([]),
  poor: ISet.new<UserId>([]),
  fair: ISet.new<UserId>([]),
} as const;

const d = answerOfDateDefaultValue;

export const fillAnswerOfDate = (
  p?: PartialAnswerOfDateJson
): AnswerOfDate => ({
  good: pipe(p?.good).chain((v) => mapOptional(v, ISet.new)).value ?? d.good,
  poor: pipe(p?.poor).chain((v) => mapOptional(v, ISet.new)).value ?? d.poor,
  fair: pipe(p?.fair).chain((v) => mapOptional(v, ISet.new)).value ?? d.fair,
});

export const answerOfDateToJson = (a: AnswerOfDate): AnswerOfDateJson => ({
  good: a.good.toArray(),
  poor: a.poor.toArray(),
  fair: a.fair.toArray(),
});
