import type { AnswerSymbolIconId } from '../enum';
import type { DatetimeRangeJsType } from './datetime-range';

export type AnswerSelectionJsType = Readonly<{
  datetimeRange: DatetimeRangeJsType;
  iconId: AnswerSymbolIconId | undefined;
}>;
