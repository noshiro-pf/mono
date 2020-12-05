import { AnswerSymbolPointEnumType } from '../types/enum/answer-symbol-point';

export const answerSymbolPointConfig = {
  minorStep: 0.1,
  majorStep: 1,
  step: 1,
  min: 0,
  max: 10,
};

export const clampAndRoundAnswerSymbolPoint = (
  x: number
): AnswerSymbolPointEnumType =>
  x < 0
    ? 0
    : 10 < x
    ? 10
    : ((Math.round(x * 10) / 10) as AnswerSymbolPointEnumType);
