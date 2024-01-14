import { Obj, isRecord, isString } from '@noshiro/ts-utils';
import { isAnswerIconPoint, type AnswerIconPoint } from '../../enum/index.mjs';

export type AnswerIconSetting = Readonly<{
  description: string;
  point: AnswerIconPoint;
}>;

export const answerIconSettingDefaultValue = {
  description: '',
  point: 0,
} as const satisfies AnswerIconSetting;

export const isAnswerIconSetting = (a: unknown): a is AnswerIconSetting =>
  isRecord(a) &&
  Obj.hasKeyValue(a, 'description', isString) &&
  Obj.hasKeyValue(a, 'point', isAnswerIconPoint);

const d = answerIconSettingDefaultValue;

export const fillAnswerIconSetting = (a?: unknown): AnswerIconSetting =>
  a === undefined || !isRecord(a)
    ? d
    : {
        description: Obj.hasKeyValue(a, 'description', isString)
          ? a.description
          : d.description,
        point: Obj.hasKeyValue(a, 'point', isAnswerIconPoint)
          ? a.point
          : d.point,
      };
