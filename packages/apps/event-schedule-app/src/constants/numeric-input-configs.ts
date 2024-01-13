import { toWeight } from '@noshiro/event-schedule-app-shared';
import { type AnswersScore } from '../types';
import { defaultIconPoint } from './default-icon-point';

type NumericInputConfigBase = Readonly<{
  step: number;
  majorStep?: number;
  min: number;
  max: number;
  digit: SafeUint;
  defaultValue: number;
}>;

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
} as const satisfies NumericInputConfigBase &
  Readonly<{
    fair: Pick<NumericInputConfigBase, 'defaultValue' | 'max' | 'min'>;
  }>;

export const weightNumericInputConfig = {
  step: toWeight(1),
  min: toWeight(0.1),
  max: toWeight(10),
  digit: toSafeUint(1),
  defaultValue: toWeight(1),
} as const satisfies NumericInputConfigBase;

export const iconFilterNumericInputConfig = {
  step: 1,
  min: 0,
  max: Number.POSITIVE_INFINITY,
  digit: toSafeUint(0),
  defaultValue: 0,
} as const satisfies NumericInputConfigBase;

export const answersScoreNumericInputConfig = {
  step: 0.01 satisfies AnswersScore,
  majorStep: 0.1 satisfies AnswersScore,
  min: 0 satisfies AnswersScore,
  max: 1 satisfies AnswersScore,
  digit: toSafeUint(2),
  defaultValue: 0 satisfies AnswersScore,
} as const satisfies NumericInputConfigBase;

const clampAndRoundFn =
  <T extends number>(
    cfg: Readonly<{
      min: T;
      max: T;
      digit: number;
      defaultValue: T;
    }>,
  ) =>
  (x: number): T =>
    !Number.isFinite(x)
      ? cfg.defaultValue
      : x < cfg.min
        ? cfg.min
        : cfg.max < x
          ? cfg.max
          : // eslint-disable-next-line no-restricted-syntax
            ((Math.round(x * 10 ** cfg.digit) / 10 ** cfg.digit) as T);

export const clampAndRoundAnswerFairIconPoint =
  clampAndRoundFn<AnswerIconPoint>({
    ...answerIconPointConfig.fair,
    digit: answerIconPointConfig.digit,
  });

export const clampAndRoundAnswerWeight = clampAndRoundFn<Weight>(
  weightNumericInputConfig,
);

export const clampAndRoundNumIcons = (x: number, upperLimit: number): number =>
  clampAndRoundFn<number>({
    defaultValue: iconFilterNumericInputConfig.defaultValue,
    digit: iconFilterNumericInputConfig.digit,
    min: iconFilterNumericInputConfig.min,
    max: upperLimit,
  })(x);

export const clampAndRoundAnswersScore = clampAndRoundFn<AnswersScore>(
  answersScoreNumericInputConfig,
);
