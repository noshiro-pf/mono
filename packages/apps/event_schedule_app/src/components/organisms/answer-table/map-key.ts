import {
  createIDatetimeRange,
  IDatetimeRange,
} from '../../../types/record/datetime-range';
import { IRecord, IRecordType } from '../../../utils/immutable';

type AnswerSelectionMapKeyBaseType = {
  datetimeRange: IDatetimeRange;
  userName: string;
};

export type IAnswerSelectionMapKey = IRecordType<AnswerSelectionMapKeyBaseType>;

const IAnswerSelectionMapKeyRecordFactory = IRecord<
  AnswerSelectionMapKeyBaseType
>({
  datetimeRange: createIDatetimeRange(),
  userName: '',
});

export const createAnswerSelectionMapKey: (
  a?: AnswerSelectionMapKeyBaseType
) => IAnswerSelectionMapKey = IAnswerSelectionMapKeyRecordFactory;
