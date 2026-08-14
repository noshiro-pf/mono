import { IMapMapped, tp } from 'ts-data-forge';
import {
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
} from '../map-key/index.mjs';

export const createAnswerTable = (
  answerSelectionMapFn: (
    datetimeRange: DatetimeRange,
    answerId: AnswerId,
  ) => readonly [
    iconId: AnswerIconIdWithNone,
    point: AnswerIconPoint,
    comment: string,
  ],
  datetimeRangeList: readonly DatetimeRange[],
  answers: readonly Answer[],
): IMapMapped<
  DatetimeRange,
  // `readonly …[]` rather than `DeepReadonly<…[]>`: the map is built from
  // tuples that are already readonly, and the deep form makes a different
  // type that `IMapMapped.create` does not produce.
  readonly (readonly [
    iconId: AnswerIconIdWithNone,
    point: AnswerIconPoint,
    comment: string,
  ])[],
  DatetimeRangeMapKey
> =>
  IMapMapped.create(
    datetimeRangeList.map((datetimeRange) =>
      tp(
        datetimeRange,
        // Annotated so the map's value type matches the declared return type:
        // `IMapMapped` is invariant in its value, and `.map` on its own infers
        // the mutable array.
        answers.map((answer) =>
          answerSelectionMapFn(datetimeRange, answer.id),
        ) as readonly (readonly [
          iconId: AnswerIconIdWithNone,
          point: AnswerIconPoint,
          comment: string,
        ])[],
      ),
    ),
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey,
  );
