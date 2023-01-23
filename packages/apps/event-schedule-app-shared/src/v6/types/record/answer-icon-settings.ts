import { isRecord, Obj } from '@noshiro/ts-utils';
import { type AnswerIconId } from '../enum';
import {
  fillAnswerIconSetting,
  isAnswerIconSetting,
  type AnswerIconSetting,
} from './base';

export type AnswerIconSettings = Record<AnswerIconId, AnswerIconSetting>;

export const answerIconSettingsDefaultValue: AnswerIconSettings = {
  good: { description: '', point: 10 },
  fair: { description: '', point: 6 },
  poor: { description: '', point: 0 },
} as const;

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
        good: Obj.hasKey(a, 'good') ? fillAnswerIconSetting(a.good) : d.good,
        fair: Obj.hasKey(a, 'fair') ? fillAnswerIconSetting(a.fair) : d.fair,
        poor: Obj.hasKey(a, 'poor') ? fillAnswerIconSetting(a.poor) : d.poor,
      };
