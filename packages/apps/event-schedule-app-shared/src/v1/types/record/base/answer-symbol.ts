import {
  type AnswerSymbolIconId,
  type AnswerSymbolPointEnumType,
} from '../../enum';

export type AnswerSymbol = Readonly<{
  iconId: AnswerSymbolIconId;
  description: string;
  point: AnswerSymbolPointEnumType;
}>;

export type PartialAnswerSymbol = Partial<AnswerSymbol>;

const defaultAnswerSymbol = {
  iconId: 'handmade-cross',
  description: '',
  point: 0,
} as const satisfies AnswerSymbol;

const d = defaultAnswerSymbol;
export const fillAnswerSymbol = (a: PartialAnswerSymbol): AnswerSymbol => ({
  iconId: a.iconId ?? d.iconId,
  description: a.description ?? d.description,
  point: a.point ?? d.point,
});
