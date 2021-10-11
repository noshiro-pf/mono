import type {
  AnswerSymbolPoint,
  Weight,
} from '@noshiro/event-schedule-app-shared';
import { createWeight } from '@noshiro/event-schedule-app-shared';
import {
  answerSymbolPointConfig,
  weightNumericInputConfig,
} from '../constants';

const cfg1 = answerSymbolPointConfig;

export const clampAndRoundAnswerFairSymbolPoint = (
  x: number
): AnswerSymbolPoint =>
  !Number.isFinite(x)
    ? 0
    : x < cfg1.fair.min
    ? cfg1.fair.min
    : cfg1.fair.max < x
    ? cfg1.fair.max
    : ((Math.round(x * 10 ** cfg1.digit) /
        10 ** cfg1.digit) as AnswerSymbolPoint);

const cfg2 = weightNumericInputConfig;

export const clampAndRoundAnswerWeight = (x: number): Weight =>
  createWeight(
    !Number.isFinite(x)
      ? 1
      : x < cfg2.min
      ? cfg2.min
      : cfg2.max < x
      ? cfg2.max
      : Math.round(x * 10 ** cfg2.digit) / 10 ** cfg2.digit
  );
