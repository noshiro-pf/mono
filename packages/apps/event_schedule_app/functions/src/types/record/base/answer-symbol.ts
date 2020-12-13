import { AnswerSymbolIconId } from '../../enum/answer-symbol-icon';
import { AnswerSymbolPointEnumType } from '../../enum/answer-symbol-point';

export type AnswerSymbolType = {
  iconId: AnswerSymbolIconId;
  description: string;
  point: AnswerSymbolPointEnumType;
};
