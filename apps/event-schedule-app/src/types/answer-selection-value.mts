import { type StrictPick } from 'ts-type-forge';

export type AnswerSelectionValue = StrictPick<
  AnswerSelection,
  'comment' | 'iconId' | 'point'
>;
