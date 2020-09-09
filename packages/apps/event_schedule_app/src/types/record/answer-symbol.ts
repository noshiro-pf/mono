import { IRecord, IRecordType } from '../../utils/immutable';
import { AnswerSymbolIconId } from '../enum/answer-symbol-icon';
import { AnswerSymbolPointEnumType } from '../enum/answer-symbol-point';

export type AnswerSymbolType = {
  name: string;
  iconId: AnswerSymbolIconId;
  description: string;
  point: AnswerSymbolPointEnumType;
};

export const IAnswerSymbol = IRecord<AnswerSymbolType>({
  name: '',
  description: '',
  iconId: 'circle',
  point: 0,
});

export type IAnswerSymbolType = IRecordType<AnswerSymbolType>;
