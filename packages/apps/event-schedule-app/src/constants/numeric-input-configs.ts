import { type AnswersScore } from '../types';
import { defaultIconPoint } from './default-icon-point';

export const answerIconPointConfig = {
  step: 1,
  min: 0,
  max: 10,
  fair: {
    min: 0.1,
    max: 9.9,
    defaultValue: defaultIconPoint.fair,
  },
  digit: 1,
  defaultValue: 0,
} as const;

export const weightNumericInputConfig = {
  step: 1,
  min: 0.1,
  max: 10,
  digit: 1,
  defaultValue: 1,
} as const;

export const iconFilterNumericInputConfig = {
  step: 1,
  min: 0,
  max: Number.POSITIVE_INFINITY,
  digit: 0,
  defaultValue: 0,
} as const;

export const answersScoreNumericInputConfig = {
  step: 0.01,
  majorStep: 0.1,
  min: 0,
  max: 1,
  digit: 2,
  defaultValue: 0,
} as const;

const clampAndRoundFn =
  <T extends number>(
    cfg: Readonly<{
      min: T;
      max: T;
      digit: number;
      defaultValue: T;
    }>
  ) =>
  (x: number): T =>
    !Number.isFinite(x)
      ? cfg.defaultValue
      : x < cfg.min
      ? cfg.min
      : cfg.max < x
      ? cfg.max
      : ((Math.round(x * 10 ** cfg.digit) / 10 ** cfg.digit) as T);

export const clampAndRoundAnswerFairIconPoint =
  clampAndRoundFn<AnswerIconPoint>({
    ...answerIconPointConfig.fair,
    digit: answerIconPointConfig.digit,
  });

export const clampAndRoundAnswerWeight = clampAndRoundFn<Weight>(
  weightNumericInputConfig
);

export const clampAndRoundNumIcons = (x: number, upperLimit: number): number =>
  clampAndRoundFn<number>({
    defaultValue: iconFilterNumericInputConfig.defaultValue,
    digit: iconFilterNumericInputConfig.digit,
    min: iconFilterNumericInputConfig.min,
    max: upperLimit,
  })(x);

export const clampAndRoundAnswersScore = clampAndRoundFn<AnswersScore>(
  answersScoreNumericInputConfig
);
