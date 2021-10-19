import type {
  AnswerSymbolIdWithNone,
  AnswerSymbolPoint,
  Weight,
} from '@noshiro/event-schedule-app-shared';

export type AnswerTableCell = Readonly<{
  iconId: AnswerSymbolIdWithNone;
  point: AnswerSymbolPoint;
  showPoint: boolean;
  weight: Weight;
}>;
