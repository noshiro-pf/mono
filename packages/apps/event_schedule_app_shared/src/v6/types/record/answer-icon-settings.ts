import { hasKey, hasKeyValue, isNonNullObject } from '@noshiro/ts-utils';
import type { AnswerIconId } from '../enum';
import type { AnswerIconSetting } from './base';
import { fillAnswerIconSetting, isAnswerIconSetting } from './base';

export type AnswerIconSettings = ReadonlyRecord<
  AnswerIconId,
  AnswerIconSetting
>;

export const answerIconSettingsDefaultValue: AnswerIconSettings = {
  good: { description: '', point: 10 },
  fair: { description: '', point: 6 },
  poor: { description: '', point: 0 },
} as const;

export const isAnswerIconSettings = (a: unknown): a is AnswerIconSettings =>
  isNonNullObject(a) &&
  hasKeyValue(a, 'good', isAnswerIconSetting) &&
  hasKeyValue(a, 'fair', isAnswerIconSetting) &&
  hasKeyValue(a, 'poor', isAnswerIconSetting);

const d = answerIconSettingsDefaultValue;

export const fillAnswerIconSettings = (a?: unknown): AnswerIconSettings =>
  !isNonNullObject(a)
    ? d
    : {
        good: hasKey(a, 'good') ? fillAnswerIconSetting(a.good) : d.good,
        fair: hasKey(a, 'fair') ? fillAnswerIconSetting(a.fair) : d.fair,
        poor: hasKey(a, 'poor') ? fillAnswerIconSetting(a.poor) : d.poor,
      };
