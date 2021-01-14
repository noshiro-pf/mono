import { DatetimeSpecificationEnumType } from './types/enum/datetime-specification-type';
import { AnswerJsType } from './types/record/answer';
import { datetimeRange2str, iconId2str } from './utils/to-str';

export const answerDiffAsString = (
  before: AnswerJsType,
  after: AnswerJsType,
  datetimeSpecification: DatetimeSpecificationEnumType
): string[] => {
  const result = [];
  if (before.userName !== after.userName) {
    result.push(`・ 名前の変更（${before.userName}→${after.userName}）`);
    result.push('');
  }

  const answerChanges: string[] = [];

  // Note: assume before.selection and after.selection are the same length and the same order
  after.selection.forEach((sel, idx) => {
    const iconBefore = before.selection[idx].iconId;
    const iconAfter = sel.iconId;
    if (iconBefore !== iconAfter) {
      answerChanges.push(
        `    ・ ${datetimeRange2str(
          sel.datetimeRange,
          datetimeSpecification
        )}：${iconId2str(iconBefore)}→${iconId2str(iconAfter)}`
      );
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
