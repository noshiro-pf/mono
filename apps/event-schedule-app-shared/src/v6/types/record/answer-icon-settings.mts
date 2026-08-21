import { hasKey, isRecord } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { hasKeyValue } from '../../../utils/index.mjs';
import { type AnswerIconId } from '../enum/index.mjs';
import {
  fillAnswerIconSetting,
  isAnswerIconSetting,
  type AnswerIconSetting,
} from './base/index.mjs';

export type AnswerIconSettings = ReadonlyRecord<
  AnswerIconId,
  AnswerIconSetting
>;

export const answerIconSettingsDefaultValue = {
  good: { description: '', point: 10 },
  fair: { description: '', point: 6 },
  poor: { description: '', point: 0 },
} as const satisfies AnswerIconSettings;

export const isAnswerIconSettings = (a: unknown): a is AnswerIconSettings =>
  isRecord(a) &&
  hasKeyValue(a, 'good', isAnswerIconSetting) &&
  hasKeyValue(a, 'fair', isAnswerIconSetting) &&
  hasKeyValue(a, 'poor', isAnswerIconSetting);

const d = answerIconSettingsDefaultValue;

export const fillAnswerIconSettings = (a?: unknown): AnswerIconSettings =>
  a === undefined || !isRecord(a)
    ? d
    : ({
        good: hasKey(a, 'good') ? fillAnswerIconSetting(a.good) : d.good,
        fair: hasKey(a, 'fair') ? fillAnswerIconSetting(a.fair) : d.fair,
        poor: hasKey(a, 'poor') ? fillAnswerIconSetting(a.poor) : d.poor,
      } as const);
