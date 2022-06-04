import {
  answerIconPointConfig,
  defaultIconPoint,
  iconFilterNumericInputConfig,
  weightNumericInputConfig,
} from '../constants';

const cfg1 = answerIconPointConfig;

export const clampAndRoundAnswerFairIconPoint = (x: number): AnswerIconPoint =>
  !Num.isFinite(x)
    ? defaultIconPoint.fair
    : x < cfg1.fair.min
    ? cfg1.fair.min
    : cfg1.fair.max < x
    ? cfg1.fair.max
    : ((Math.round(x * 10 ** cfg1.digit) /
        10 ** cfg1.digit) as AnswerIconPoint);

const cfg2 = weightNumericInputConfig;

export const clampAndRoundAnswerWeight = (x: number): Weight =>
  !Num.isFinite(x)
    ? 1
    : x < cfg2.min
    ? cfg2.min
    : cfg2.max < x
    ? cfg2.max
    : Math.round(x * 10 ** cfg2.digit) / 10 ** cfg2.digit;

const cfg3 = iconFilterNumericInputConfig;

export const clampAndRoundNumIcons = (x: number, upperLimit: number): number =>
  !Num.isFinite(x)
    ? 0
    : x < cfg3.min
    ? cfg3.min
    : upperLimit < x
    ? upperLimit
    : Math.round(x);
