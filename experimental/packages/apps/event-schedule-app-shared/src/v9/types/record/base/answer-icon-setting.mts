import * as t from '@noshiro/io-ts';
import {
  type AnswerIconPoint,
  createAnswerIconPointType,
} from '../../enum/index.mjs';

export const createAnswerIconSettingType = <D extends AnswerIconPoint>(
  defaultValue: D,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) =>
  t.record({
    description: t.string(''),
    point: createAnswerIconPointType(defaultValue),
  });

export const AnswerIconSetting = createAnswerIconSettingType(0);

export type AnswerIconSetting = t.TypeOf<typeof AnswerIconSetting>;
