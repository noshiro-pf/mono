import { answerId, AnswerId } from '../../../types/phantom';
import {
  createIDatetimeRange,
  IDatetimeRange,
} from '../../../types/record/datetime-range';
import { IRecord } from '../../../utils/immutable';

type AnswerSelectionMapKeyBaseType = Readonly<{
  answerId: AnswerId;
  datetimeRange: IDatetimeRange;
}>;

export type IAnswerSelectionMapKey = IRecord<AnswerSelectionMapKeyBaseType> &
  Readonly<AnswerSelectionMapKeyBaseType>;

const IAnswerSelectionMapKeyRecordFactory = IRecord<AnswerSelectionMapKeyBaseType>(
  {
    answerId: answerId(''),
    datetimeRange: createIDatetimeRange(),
  }
);

export const createAnswerSelectionMapKey: (
  a?: AnswerSelectionMapKeyBaseType
) => IAnswerSelectionMapKey = IAnswerSelectionMapKeyRecordFactory;
