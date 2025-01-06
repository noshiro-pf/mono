import { Weight } from '@noshiro/event-schedule-app-shared';
import {
  type NumericTypeProperties,
  clampAndRoundFn,
} from '@noshiro/numeric-input-utils';
import { type AnswerRank, type AnswersScore } from '../types';
import { defaultIconPoint } from './default-icon-point';

type NumericInputConfigBase<N extends number> = Readonly<{
  step: number;
  majorStep?: number;
}> &
  NumericTypeProperties<N>;

export const answerIconPointConfig = {
  step: 1 satisfies AnswerIconPoint,
  min: 0 satisfies AnswerIconPoint,
  max: 10 satisfies AnswerIconPoint,
  fair: {
    min: 0.1 satisfies AnswerIconPoint,
    max: 9.9 satisfies AnswerIconPoint,
    defaultValue: defaultIconPoint.fair satisfies AnswerIconPoint,
  },
  digit: toSafeUint(1),
  defaultValue: 0 satisfies AnswerIconPoint,
} as const satisfies NumericInputConfigBase<AnswerIconPoint> &
  Readonly<{
    fair: Pick<
      NumericInputConfigBase<AnswerIconPoint>,
      'defaultValue' | 'max' | 'min'
    >;
  }>;

export const weightNumericInputConfig = {
  step: Weight.cast(1),
  min: Weight.cast(0.1),
  max: Weight.cast(10),
  digit: toSafeUint(1),
  defaultValue: Weight.cast(1),
} as const satisfies NumericInputConfigBase<Weight>;

export const iconFilterNumericInputConfig = {
  step: 1,
  min: 0,
  max: Number.POSITIVE_INFINITY,
  digit: toSafeUint(0),
  defaultValue: 0,
} as const satisfies NumericInputConfigBase<number>;

export const answersScoreNumericInputConfig = {
  step: 0.01 satisfies AnswersScore,
  majorStep: 0.1 satisfies AnswersScore,
  min: 0 satisfies AnswersScore,
  max: 1 satisfies AnswersScore,
  digit: toSafeUint(2),
  defaultValue: 0 satisfies AnswersScore,
} as const satisfies NumericInputConfigBase<AnswersScore>;

export const answerRankNumericInputConfig = {
  step: 1 satisfies AnswerRank,
  majorStep: 1 satisfies AnswerRank,
  min: 1 satisfies AnswerRank,
  max: 10 satisfies AnswerRank,
  digit: toSafeUint(0),
  defaultValue: 3 satisfies AnswerRank,
} as const satisfies NumericInputConfigBase<AnswerRank>;

export const clampAndRoundAnswerFairIconPoint =
  clampAndRoundFn<AnswerIconPoint>({
    ...answerIconPointConfig.fair,
    digit: answerIconPointConfig.digit,
  });

export const clampAndRoundAnswerWeight = clampAndRoundFn<Weight>(
  weightNumericInputConfig,
);

export const clampAndRoundNumIcons = (
  x: number,
  upperLimit: SafeUint,
): SafeUint =>
  clampAndRoundFn<SafeUint>({
    defaultValue: toSafeUint(iconFilterNumericInputConfig.defaultValue),
    digit: iconFilterNumericInputConfig.digit,
    min: toSafeUint(iconFilterNumericInputConfig.min),
    max: upperLimit,
  })(x);

export const clampAndRoundAnswersScore = clampAndRoundFn<AnswersScore>(
  answersScoreNumericInputConfig,
);

export const clampAndRoundAnswerRank = clampAndRoundFn<AnswerRank>(
  answerRankNumericInputConfig,
);
