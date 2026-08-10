import { isRecord, Obj } from '@noshiro/ts-utils';
import { type AnswerIconId } from '../enum/index.mjs';
import {
  fillAnswerIconSetting,
  isAnswerIconSetting,
  type AnswerIconSetting,
} from './base/index.mjs';

export type AnswerIconSettings = Record<AnswerIconId, AnswerIconSetting>;

export const answerIconSettingsDefaultValue = {
  good: { description: '', point: 10 },
  fair: { description: '', point: 6 },
  poor: { description: '', point: 0 },
} as const satisfies AnswerIconSettings;

export const isAnswerIconSettings = (a: unknown): a is AnswerIconSettings =>
  isRecord(a) &&
  Obj.hasKeyValue(a, 'good', isAnswerIconSetting) &&
  Obj.hasKeyValue(a, 'fair', isAnswerIconSetting) &&
  Obj.hasKeyValue(a, 'poor', isAnswerIconSetting);

const d = answerIconSettingsDefaultValue;

export const fillAnswerIconSettings = (a?: unknown): AnswerIconSettings =>
  a === undefined || !isRecord(a)
    ? d
    : {
        good: Object.hasOwn(a, 'good') ? fillAnswerIconSetting(a.good) : d.good,
        fair: Object.hasOwn(a, 'fair') ? fillAnswerIconSetting(a.fair) : d.fair,
        poor: Object.hasOwn(a, 'poor') ? fillAnswerIconSetting(a.poor) : d.poor,
      };
