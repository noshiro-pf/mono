import { IRecord, IRecordType } from '../../../utils/immutable';
import { AnswerSymbolIconId } from '../../enum/answer-symbol-icon';
import { AnswerSymbolPointEnumType } from '../../enum/answer-symbol-point';

type AnswerSymbolBaseType = {
  iconId: AnswerSymbolIconId;
  description: string;
  point: AnswerSymbolPointEnumType;
};

export type PartialAnswerSymbol = Partial<Readonly<AnswerSymbolBaseType>>;

export type IAnswerSymbol = IRecordType<AnswerSymbolBaseType>;

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
