import type { AnswerSymbolIconId, AnswerSymbolPointEnumType } from '../../enum';

export type AnswerSymbolType = Readonly<{
  iconId: AnswerSymbolIconId;
  description: string;
  point: AnswerSymbolPointEnumType;
}>;
