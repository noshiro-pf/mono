import type {
  Answer,
  DatetimeSpecificationEnumType,
} from '@noshiro/event-schedule-app-shared';
import { datetimeRange2str, iconId2str } from './utils';

export const answerDiffAsString = (
  before: Answer,
  after: Answer,
  datetimeSpecification: DatetimeSpecificationEnumType
): string[] => {
  const result = [];
  if (before.user.name !== after.user.name) {
    result.push(`・ 名前の変更（${before.user.name}→${after.user.name}）`);
    result.push('');
  }

  const answerChanges: string[] = [];

  // Note: assume before.selection and after.selection are the same length and the same order
  after.selection.forEach((sel, idx) => {
    const iconBefore = before.selection[idx]?.iconId ?? 'none';
    const iconAfter = sel.iconId;
    if (iconBefore !== iconAfter) {
      answerChanges.push(
        `    ・ ${datetimeRange2str(
          sel.datetimeRange,
          datetimeSpecification
        )}：${iconId2str(iconBefore)}→${iconId2str(iconAfter)}`
      );
    }
    {
      const pointBefore = before.selection[idx]?.point ?? 0;
      const pointAfter = sel.point;

      if (
        iconBefore === 'fair' &&
        iconAfter === 'fair' &&
        pointBefore !== pointAfter
      ) {
        answerChanges.push(
          `    ・ ${datetimeRange2str(
            sel.datetimeRange,
            datetimeSpecification
          )}：${iconId2str(iconBefore)}(${pointBefore})→${iconId2str(
            iconAfter
          )}(${pointAfter})`
        );
      }
    }
  });

  if (answerChanges.length > 0) {
    result.push('・ 回答の変更');
    result.push(...answerChanges);
    result.push('');
  }

  if (before.comment !== after.comment) {
    result.push('・ コメントの変更：');
    result.push(`    ・ （変更前）：${before.comment}`);
    result.push(`    ・ （変更後）：${after.comment}`);
  }
  return result;
};
