import { IRecord } from '../../../utils';
import type { AnswerSymbolIconId, AnswerSymbolPointEnumType } from '../../enum';

type AnswerSymbolBaseType = Readonly<{
  iconId: AnswerSymbolIconId;
  description: string;
  point: AnswerSymbolPointEnumType;
}>;

export type PartialAnswerSymbol = Partial<Readonly<AnswerSymbolBaseType>>;

export type IAnswerSymbol = Readonly<
  AnswerSymbolBaseType & IRecord<AnswerSymbolBaseType>
>;

const IAnswerSymbolRecordFactory = IRecord<AnswerSymbolBaseType>({
  iconId: 'handmade-cross',
  description: '',
  point: 0,
});

export const createIAnswerSymbol: (a?: AnswerSymbolBaseType) => IAnswerSymbol =
  IAnswerSymbolRecordFactory;

export const fillAnswerSymbol: (a: PartialAnswerSymbol) => IAnswerSymbol =
  IAnswerSymbolRecordFactory;
