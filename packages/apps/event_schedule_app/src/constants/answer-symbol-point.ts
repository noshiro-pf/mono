import type { AnswerSymbolPointEnumType } from '../types/enum/answer-symbol-point';

export const answerSymbolPointConfig = {
  minorStep: 0.1,
  majorStep: 1,
  step: 1,
  min: 0,
  max: 10,
} as const;

const cfg = answerSymbolPointConfig;

export const clampAndRoundAnswerSymbolPoint = (
  x: number
): AnswerSymbolPointEnumType =>
  x < 0
    ? 0
    : cfg.max < x
    ? cfg.max
    : ((Math.round(x / cfg.step) * cfg.step) as AnswerSymbolPointEnumType);
