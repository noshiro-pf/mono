import { fillDatetimeRange } from '@noshiro/event-schedule-app-shared';

export type AnswerSelectionMapKey = Brand<string, 'AnswerSelectionMapKey'>;

type AnswerSelectionData = Readonly<{
  answerId: AnswerId;
  datetimeRange: DatetimeRange;
}>;

export const answerSelectionToMapKey = (
  answerSelection: AnswerSelectionData
): AnswerSelectionMapKey =>
  Result.unwrapThrow(Json.stringify(answerSelection)) as AnswerSelectionMapKey;

export const answerSelectionFromMapKey = (
  key: AnswerSelectionMapKey
): AnswerSelectionData => {
  const parsed = Result.unwrapThrow(Json.parse(key)) as {
    answerId: AnswerId;
    datetimeRange: DatetimeRange;
  };
  return {
    answerId: parsed.answerId,
    datetimeRange: fillDatetimeRange(parsed.datetimeRange),
  };
};
