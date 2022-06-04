import { IRecord, isRecord } from '@noshiro/ts-utils';
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
  isRecord(a) &&
  IRecord.hasKeyValue(a, 'good', isAnswerIconSetting) &&
  IRecord.hasKeyValue(a, 'fair', isAnswerIconSetting) &&
  IRecord.hasKeyValue(a, 'poor', isAnswerIconSetting);

const d = answerIconSettingsDefaultValue;

export const fillAnswerIconSettings = (a?: unknown): AnswerIconSettings =>
  a === undefined || !isRecord(a)
    ? d
    : {
        good: IRecord.hasKey(a, 'good')
          ? fillAnswerIconSetting(a.good)
          : d.good,
        fair: IRecord.hasKey(a, 'fair')
          ? fillAnswerIconSetting(a.fair)
          : d.fair,
        poor: IRecord.hasKey(a, 'poor')
          ? fillAnswerIconSetting(a.poor)
          : d.poor,
      };
