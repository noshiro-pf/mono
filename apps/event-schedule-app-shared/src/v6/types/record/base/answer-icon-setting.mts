import { isRecord, isString } from 'ts-data-forge';
import { hasKeyValue } from '../../../../utils/index.mjs';
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
  hasKeyValue(a, 'description', isString) &&
  hasKeyValue(a, 'point', isAnswerIconPoint);

const d = answerIconSettingDefaultValue;

export const fillAnswerIconSetting = (a?: unknown): AnswerIconSetting =>
  a === undefined || !isRecord(a)
    ? d
    : ({
        description: hasKeyValue(a, 'description', isString)
          ? a.description
          : d.description,
        point: hasKeyValue(a, 'point', isAnswerIconPoint) ? a.point : d.point,
      } as const);
