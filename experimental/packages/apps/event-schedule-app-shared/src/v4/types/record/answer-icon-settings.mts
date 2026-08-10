import { type AnswerIconId } from '../enum/index.mjs';
import {
  fillAnswerIconSetting,
  type AnswerIconSetting,
} from './base/index.mjs';

export type AnswerIconSettings = Record<AnswerIconId, AnswerIconSetting>;

export type PartialAnswerIconSettings = DeepPartial<AnswerIconSettings>;

const defaultAnswerIconSettings = {
  good: { description: '', point: 10 },
  fair: { description: '', point: 6 },
  poor: { description: '', point: 0 },
} as const satisfies AnswerIconSettings;

const d = defaultAnswerIconSettings;
export const fillAnswerIconSettings = (
  p?: PartialAnswerIconSettings,
): AnswerIconSettings => ({
  good: fillAnswerIconSetting(p?.good ?? d.good),
  fair: fillAnswerIconSetting(p?.fair ?? d.fair),
  poor: fillAnswerIconSetting(p?.poor ?? d.poor),
});
