import type { AnswerSymbolIconId } from '../../enum/answer-symbol-icon';
import type { AnswerSymbolPointEnumType } from '../../enum/answer-symbol-point';

export type AnswerSymbolType = Readonly<{
  iconId: AnswerSymbolIconId;
  description: string;
  point: AnswerSymbolPointEnumType;
}>;
