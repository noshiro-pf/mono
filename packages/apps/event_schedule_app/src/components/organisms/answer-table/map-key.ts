import type { AnswerId } from '../../../types/phantom';
import { answerId } from '../../../types/phantom';
import type { IDatetimeRange } from '../../../types/record/datetime-range';
import { createIDatetimeRange } from '../../../types/record/datetime-range';
import { IRecord } from '../../../utils/immutable';

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
