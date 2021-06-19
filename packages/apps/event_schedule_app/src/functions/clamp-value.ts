import type { AnswerSymbolPointEnumType } from '@noshiro/event-schedule-app-api';
import {
  answerSymbolPointConfig,
  weightNumericInputConfig,
} from '../constants';

const cfg1 = answerSymbolPointConfig;

export const clampAndRoundAnswerSymbolPoint = (
  x: number
): AnswerSymbolPointEnumType =>
  x < cfg1.min
    ? cfg1.min
    : cfg1.max < x
    ? cfg1.max
    : ((Math.round(x * 10 ** cfg1.digit) /
        10 ** cfg1.digit) as AnswerSymbolPointEnumType);

const cfg2 = weightNumericInputConfig;

export const clampAndRoundAnswerWeight = (x: number): number =>
  x < cfg2.min
    ? cfg2.min
    : cfg2.max < x
    ? cfg2.max
    : Math.round(x * 10 ** cfg2.digit) / 10 ** cfg2.digit;
