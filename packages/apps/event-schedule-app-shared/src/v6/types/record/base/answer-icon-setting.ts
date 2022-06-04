import { IRecord, isRecord, isString } from '@noshiro/ts-utils';
import type { AnswerIconPoint } from '../../enum';
import { isAnswerIconPoint } from '../../enum';

export type AnswerIconSetting = Readonly<{
  description: string;
  point: AnswerIconPoint;
}>;

export const answerIconSettingDefaultValue: AnswerIconSetting = {
  description: '',
  point: 0,
} as const;

export const isAnswerIconSetting = (a: unknown): a is AnswerIconSetting =>
  isRecord(a) &&
  IRecord.hasKeyValue(a, 'description', isString) &&
  IRecord.hasKeyValue(a, 'point', isAnswerIconPoint);

const d = answerIconSettingDefaultValue;

export const fillAnswerIconSetting = (a?: unknown): AnswerIconSetting =>
  a === undefined || !isRecord(a)
    ? d
    : {
        description: IRecord.hasKeyValue(a, 'description', isString)
          ? a.description
          : d.description,
        point: IRecord.hasKeyValue(a, 'point', isAnswerIconPoint)
          ? a.point
          : d.point,
      };
