import * as t from '@noshiro/io-ts';
import { answerIconSettingTypeDef } from './base';

export const answerIconSettingsTypeDef = t.record({
  good: answerIconSettingTypeDef(10),
  fair: answerIconSettingTypeDef(6),
  poor: answerIconSettingTypeDef(0),
});

export type AnswerIconSettings = t.TypeOf<typeof answerIconSettingsTypeDef>;

export const answerIconSettingsDefaultValue =
  answerIconSettingsTypeDef.defaultValue;

export const isAnswerIconSettings = answerIconSettingsTypeDef.is;

export const fillAnswerIconSettings = answerIconSettingsTypeDef.fill;
