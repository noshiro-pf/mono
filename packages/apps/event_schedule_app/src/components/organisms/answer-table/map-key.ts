import {
  createIDatetimeRange,
  IDatetimeRange,
} from '../../../types/record/datetime-range';
import { IRecord } from '../../../utils/immutable';

type AnswerSelectionMapKeyBaseType = {
  datetimeRange: IDatetimeRange;
  userName: string;
};

export type IAnswerSelectionMapKey = IRecord<AnswerSelectionMapKeyBaseType> &
  Readonly<AnswerSelectionMapKeyBaseType>;

const IAnswerSelectionMapKeyRecordFactory = IRecord<AnswerSelectionMapKeyBaseType>(
  {
    datetimeRange: createIDatetimeRange(),
    userName: '',
  }
);

export const createAnswerSelectionMapKey: (
  a?: AnswerSelectionMapKeyBaseType
) => IAnswerSelectionMapKey = IAnswerSelectionMapKeyRecordFactory;
