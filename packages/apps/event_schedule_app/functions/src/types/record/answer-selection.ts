import { AnswerSymbolIconId } from '../enum/answer-symbol-icon';
import { DatetimeRangeJsType } from './datetime-range';

export type AnswerSelectionJsType = Readonly<{
  datetimeRange: DatetimeRangeJsType;
  iconId: AnswerSymbolIconId | undefined;
}>;
