import type { AnswerSymbolIconId } from '../enum/answer-symbol-icon';
import type { DatetimeRangeJsType } from './datetime-range';

export type AnswerSelectionJsType = Readonly<{
  datetimeRange: DatetimeRangeJsType;
  iconId: AnswerSymbolIconId | undefined;
}>;
