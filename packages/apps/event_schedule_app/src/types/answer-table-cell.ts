import type {
  AnswerIconIdWithNone,
  AnswerIconPoint,
  Weight,
} from '@noshiro/event-schedule-app-shared';

export type AnswerTableCell = Readonly<{
  iconId: AnswerIconIdWithNone;
  point: AnswerIconPoint;
  showPoint: boolean;
  weight: Weight;
}>;
