import { IRecord } from '../../utils/immutable';
import type { AnswerSymbolIconId } from '../enum/answer-symbol-icon';
import type { IDatetimeRange, PartialDatetimeRange } from './datetime-range';
import { createIDatetimeRange, fillDatetimeRange } from './datetime-range';

type AnswerSelectionBaseType = Readonly<{
  datetimeRange: IDatetimeRange;
  iconId: AnswerSymbolIconId | undefined;
}>;

export type PartialAnswerSelection = Partial<
  Readonly<{
    datetimeRange: PartialDatetimeRange;
    iconId: AnswerSymbolIconId | undefined;
  }>
>;

export type IAnswerSelection = IRecord<AnswerSelectionBaseType> &
  Readonly<AnswerSelectionBaseType>;

const IAnswerSelectionRecordFactory = IRecord<AnswerSelectionBaseType>({
  datetimeRange: createIDatetimeRange(),
  iconId: undefined,
});

export const createIAnswerSelection: (
  a?: AnswerSelectionBaseType
) => IAnswerSelection = IAnswerSelectionRecordFactory;

const d = IAnswerSelectionRecordFactory();
export const fillAnswerSelection = (
  p?: PartialAnswerSelection
): IAnswerSelection =>
  createIAnswerSelection({
    datetimeRange: fillDatetimeRange(p?.datetimeRange ?? d.datetimeRange),
    iconId: p?.iconId ?? d.iconId,
  });
