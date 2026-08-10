import * as t from '@noshiro/io-ts';
import { createAnswerIconSettingType } from './base/index.mjs';

export const AnswerIconSettings = t.record({
  good: createAnswerIconSettingType(10),
  fair: createAnswerIconSettingType(6),
  poor: createAnswerIconSettingType(0),
});

export type AnswerIconSettings = t.TypeOf<typeof AnswerIconSettings>;
