import type { AnswerSymbolIconId } from '../enum';
import type { DatetimeRange, PartialDatetimeRange } from './datetime-range';
import { defaultDatetimeRange, fillDatetimeRange } from './datetime-range';

export type AnswerSelection = Readonly<{
  datetimeRange: DatetimeRange;
  iconId: AnswerSymbolIconId | undefined;
}>;

export type PartialAnswerSelection = Partial<
  Readonly<{
    datetimeRange: PartialDatetimeRange;
    iconId: AnswerSymbolIconId | undefined;
  }>
>;

const defaultAnswerSelection: AnswerSelection = {
  datetimeRange: defaultDatetimeRange,
  iconId: undefined,
} as const;

const d = defaultAnswerSelection;
export const fillAnswerSelection = (
  p?: PartialAnswerSelection
): AnswerSelection => ({
  datetimeRange: fillDatetimeRange(p?.datetimeRange ?? d.datetimeRange),
  iconId: p?.iconId ?? d.iconId,
});
