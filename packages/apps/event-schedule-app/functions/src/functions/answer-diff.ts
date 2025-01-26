import {
  type Answer,
  type AnswerIconIdWithNone,
  type AnswerIconPoint,
  type DatetimeSpecificationEnumType,
} from '@noshiro/event-schedule-app-shared';
import { compareDatetimeRange, type DatetimeRange } from '@noshiro/io-ts-types';
import { IMapMapped, ISetMapped, tp } from '@noshiro/ts-utils';
import {
  datetimeRange2str,
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
  iconId2str,
} from '../utils/index.js';

const answerDiffRowStr = ({
  datetimeRange,
  datetimeSpecification,
  iconBefore,
  pointBefore,
  iconAfter,
  pointAfter,
}: Readonly<{
  datetimeRange: DatetimeRange;
  datetimeSpecification: DatetimeSpecificationEnumType;
  iconBefore: AnswerIconIdWithNone;
  iconAfter: AnswerIconIdWithNone;
  pointBefore: AnswerIconPoint;
  pointAfter: AnswerIconPoint;
}>): string =>
  `    ・ ${datetimeRange2str(
    datetimeRange,
    datetimeSpecification,
  )}：${iconId2str(iconBefore, pointBefore)}→${iconId2str(
    iconAfter,
    pointAfter,
  )}`;

export const answerDiffAsString = (
  before: Answer,
  after: Answer,
  datetimeSpecification: DatetimeSpecificationEnumType,
): string[] => {
  const mut_result = [];

  if (before.user.name !== after.user.name) {
    mut_result.push(
      `・ 名前の変更（${before.user.name}→${after.user.name}）`,
      '',
    );
  }

  {
    const mut_answerChanges: string[] = [];

    const allDatetimeRangeSet = ISetMapped.new(
      [
        ...before.selection.map((s) => s.datetimeRange),
        ...after.selection.map((s) => s.datetimeRange),
      ],
      datetimeRangeToMapKey,
      datetimeRangeFromMapKey,
    );

    const allDatetimeRangeSorted = allDatetimeRangeSet
      .toArray()
      .toSorted(compareDatetimeRange);

    const datetimeRangeToBeforeIconIdMap = IMapMapped.new(
      before.selection.map((s) =>
        tp(s.datetimeRange, { iconId: s.iconId, point: s.point }),
      ),
      datetimeRangeToMapKey,
      datetimeRangeFromMapKey,
    );

    const datetimeRangeToAfterIconIdMap = IMapMapped.new(
      after.selection.map((s) =>
        tp(s.datetimeRange, { iconId: s.iconId, point: s.point }),
      ),
      datetimeRangeToMapKey,
      datetimeRangeFromMapKey,
    );

    // Note: assume before.selection and after.selection are the same length and the same order
    for (const datetimeRange of allDatetimeRangeSorted) {
      const selectionBefore = datetimeRangeToBeforeIconIdMap.get(datetimeRange);
      const selectionAfter = datetimeRangeToAfterIconIdMap.get(datetimeRange);

      const iconBefore = selectionBefore?.iconId ?? 'none';
      const iconAfter = selectionAfter?.iconId ?? 'none';

      const pointBefore = selectionBefore?.point ?? 0;
      const pointAfter = selectionAfter?.point ?? 0;

      if (
        iconBefore !== iconAfter ||
        (iconBefore === 'fair' &&
          iconAfter === 'fair' &&
          pointBefore !== pointAfter)
      ) {
        mut_answerChanges.push(
          answerDiffRowStr({
            datetimeRange,
            datetimeSpecification,
            iconAfter,
            iconBefore,
            pointAfter,
            pointBefore,
          }),
        );
      }
    }

    if (mut_answerChanges.length > 0) {
      mut_result.push('・ 回答の変更', ...mut_answerChanges, '');
    }
  }

  if (before.comment !== after.comment) {
    mut_result.push(
      '・ コメントの変更：',
      `    ・ （変更前）：${before.comment}`,
      `    ・ （変更後）：${after.comment}`,
    );
  }

  if (before.isRequiredParticipants !== after.isRequiredParticipants) {
    mut_result.push(
      '・ 必須参加者チェックの変更：',
      `    ・ （変更前）：${before.isRequiredParticipants ? 'オン' : 'オフ'}`,
      `    ・ （変更後）：${after.isRequiredParticipants ? 'オン' : 'オフ'}`,
    );
  }

  if (before.weight !== after.weight) {
    mut_result.push(
      '・ 回答の重みの変更：',
      `    ・ （変更前）：${before.weight}人分としてカウント`,
      `    ・ （変更後）：${after.weight}人分としてカウント`,
    );
  }
  return mut_result;
};
