/* eslint-disable @typescript-eslint/no-namespace */

import { clampAndRound } from './numeric-type-utils';

export type ScoreType =
  | 0
  | 0.1
  | 0.2
  | 0.3
  | 0.4
  | 0.5
  | 0.6
  | 0.7
  | 0.8
  | 0.9
  | 1;

export namespace ScoreType {
  export const min = 0 satisfies ScoreType;
  export const max = 1 satisfies ScoreType;
  export const defaultValue = 0 satisfies ScoreType;
  export const digit = 1;
  export const step = 0.1;

  const clampAndRoundScore = clampAndRound<ScoreType>({
    defaultValue,
    digit,
    max,
    min,
    step,
  });

  export const encode = (s: ScoreType): string => s.toString();

  export const decode = (s: string): ScoreType =>
    clampAndRoundScore(Number.parseFloat(s));
}
