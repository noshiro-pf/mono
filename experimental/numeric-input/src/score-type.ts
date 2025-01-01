import { createNumberType } from '@noshiro/numeric-input-utils';

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

export const ScoreType = createNumberType<ScoreType>({
  min: 0,
  max: 1,
  digit: 1,
  defaultValue: 0,
});
