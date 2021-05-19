import type { AnswerId, IDatetimeRange } from '../../../types';
import { answerId, createIDatetimeRange } from '../../../types';
import { IRecord } from '../../../utils';

type AnswerSelectionMapKeyBaseType = Readonly<{
  answerId: AnswerId;
  datetimeRange: IDatetimeRange;
}>;

export type IAnswerSelectionMapKey = IRecord<AnswerSelectionMapKeyBaseType> &
  Readonly<AnswerSelectionMapKeyBaseType>;

const IAnswerSelectionMapKeyRecordFactory =
  IRecord<AnswerSelectionMapKeyBaseType>({
    answerId: answerId(''),
    datetimeRange: createIDatetimeRange(),
  });

export const createAnswerSelectionMapKey: (
  a?: AnswerSelectionMapKeyBaseType
) => IAnswerSelectionMapKey = IAnswerSelectionMapKeyRecordFactory;
