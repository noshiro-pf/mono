import { AnswerSelectionJsType } from './answer-selection';

export type AnswerJsType = {
  id: string;
  userName: string;
  comment: string;
  selection: AnswerSelectionJsType[];
  createdAt: number;
};
