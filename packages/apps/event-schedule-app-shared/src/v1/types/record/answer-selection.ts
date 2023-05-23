import { type AnswerSymbolIconId } from '../enum';
import {
  defaultDatetimeRange,
  fillDatetimeRange,
  type DatetimeRange,
  type PartialDatetimeRange,
} from './datetime-range';

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

const defaultAnswerSelection = {
  datetimeRange: defaultDatetimeRange,
  iconId: undefined,
} as const satisfies AnswerSelection;

const d = defaultAnswerSelection;
export const fillAnswerSelection = (
  p?: PartialAnswerSelection
): AnswerSelection => ({
  datetimeRange: fillDatetimeRange(p?.datetimeRange ?? d.datetimeRange),
  iconId: p?.iconId ?? d.iconId,
});
