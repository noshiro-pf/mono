import type {
  AnswerId,
  DatetimeRange,
} from '@noshiro/event-schedule-app-shared';
import { fillDatetimeRange } from '@noshiro/event-schedule-app-shared';
import type { Phantomic } from '@noshiro/ts-utils-additional';

export type AnswerSelectionMapKey = Phantomic<string, 'AnswerSelectionMapKey'>;

type AnswerSelectionData = Readonly<{
  answerId: AnswerId;
  datetimeRange: DatetimeRange;
}>;

export const answerSelectionToMapKey = (
  answerSelection: AnswerSelectionData
): AnswerSelectionMapKey =>
  JSON.stringify(answerSelection) as AnswerSelectionMapKey;

export const answerSelectionFromMapKey = (
  key: AnswerSelectionMapKey
): AnswerSelectionData => {
  const parsed = JSON.parse(key) as {
    answerId: AnswerId;
    datetimeRange: DatetimeRange;
  };
  return {
    answerId: parsed.answerId,
    datetimeRange: fillDatetimeRange(parsed.datetimeRange),
  };
};
