import { Json, Result } from 'ts-data-forge';
import { DatetimeRange } from 'ts-fortress-types';
import { type Brand } from 'ts-type-forge';

export type AnswerSelectionMapKey = Brand<string, 'AnswerSelectionMapKey'>;

type AnswerSelectionData = Readonly<{
  answerId: AnswerId;
  datetimeRange: DatetimeRange;
}>;

export const answerSelectionToMapKey = (
  answerSelection: AnswerSelectionData,
): AnswerSelectionMapKey =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Result.unwrapThrow(Json.stringify(answerSelection)) as AnswerSelectionMapKey;

export const answerSelectionFromMapKey = (
  key: AnswerSelectionMapKey,
): AnswerSelectionData => {
  const parsed =
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    Result.unwrapThrow(Json.parse(key)) as Readonly<{
      answerId: AnswerId;
      datetimeRange: DatetimeRange;
    }>;

  return {
    answerId: parsed.answerId,
    datetimeRange: DatetimeRange.fill(parsed.datetimeRange),
  };
};
