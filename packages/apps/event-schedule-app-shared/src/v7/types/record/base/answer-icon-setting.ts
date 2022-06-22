import * as t from '@noshiro/io-ts';
import type { AnswerIconPoint } from '../../enum';
import { answerIconPointTypeDef } from '../../enum';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const answerIconSettingTypeDef = <D extends AnswerIconPoint>(
  defaultValue: D
) =>
  t.record({
    description: t.string(''),
    point: answerIconPointTypeDef(defaultValue),
  });

const answerIconSettingTypeDef0 = answerIconSettingTypeDef(0);

export type AnswerIconSetting = t.Typeof<typeof answerIconSettingTypeDef0>;

export const answerIconSettingDefaultValue =
  answerIconSettingTypeDef0.defaultValue;

export const isAnswerIconSetting = answerIconSettingTypeDef0.is;

export const fillAnswerIconSetting = answerIconSettingTypeDef0.fill;
