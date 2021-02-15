import { IRecord } from '../../../utils/immutable';
import { AnswerSymbolIconId } from '../../enum/answer-symbol-icon';
import { AnswerSymbolPointEnumType } from '../../enum/answer-symbol-point';

type AnswerSymbolBaseType = Readonly<{
  iconId: AnswerSymbolIconId;
  description: string;
  point: AnswerSymbolPointEnumType;
}>;

export type PartialAnswerSymbol = Partial<Readonly<AnswerSymbolBaseType>>;

export type IAnswerSymbol = IRecord<AnswerSymbolBaseType> &
  Readonly<AnswerSymbolBaseType>;

const IAnswerSymbolRecordFactory = IRecord<AnswerSymbolBaseType>({
  iconId: 'handmade-cross',
  description: '',
  point: 0,
});

export const createIAnswerSymbol: (
  a?: AnswerSymbolBaseType
) => IAnswerSymbol = IAnswerSymbolRecordFactory;

export const fillAnswerSymbol: (
  a: PartialAnswerSymbol
) => IAnswerSymbol = IAnswerSymbolRecordFactory;
