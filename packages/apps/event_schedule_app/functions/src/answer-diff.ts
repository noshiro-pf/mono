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
  const mut_result = [];
  if (before.user.name !== after.user.name) {
    mut_result.push(`・ 名前の変更（${before.user.name}→${after.user.name}）`);
    mut_result.push('');
  }

  const mut_answerChanges: string[] = [];

  // Note: assume before.selection and after.selection are the same length and the same order
  after.selection.forEach((sel, idx) => {
    const iconBefore = before.selection[idx]?.iconId ?? 'none';
    const iconAfter = sel.iconId;
    if (iconBefore !== iconAfter) {
      mut_answerChanges.push(
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
        mut_answerChanges.push(
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

  if (mut_answerChanges.length > 0) {
    mut_result.push('・ 回答の変更');
    mut_result.push(...mut_answerChanges);
    mut_result.push('');
  }

  if (before.comment !== after.comment) {
    mut_result.push('・ コメントの変更：');
    mut_result.push(`    ・ （変更前）：${before.comment}`);
    mut_result.push(`    ・ （変更後）：${after.comment}`);
  }
  return mut_result;
};
