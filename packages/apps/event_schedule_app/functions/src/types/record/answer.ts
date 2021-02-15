import { AnswerSelectionJsType } from './answer-selection';

export type AnswerJsType = Readonly<{
  id: string;
  userName: string;
  comment: string;
  selection: readonly AnswerSelectionJsType[];
  createdAt: number;
}>;
