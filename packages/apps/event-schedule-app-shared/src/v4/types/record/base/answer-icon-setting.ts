import { type AnswerIconPoint } from '../../enum';

export type AnswerIconSetting = Readonly<{
  description: string;
  point: AnswerIconPoint;
}>;

export type PartialAnswerIconSetting = Partial<AnswerIconSetting>;

export const defaultAnswerIconSetting: AnswerIconSetting = {
  description: '',
  point: 0,
} as const;

const d = defaultAnswerIconSetting;
export const fillAnswerIconSetting = (
  a: PartialAnswerIconSetting
): AnswerIconSetting => ({
  description: a.description ?? d.description,
  point: a.point ?? d.point,
});
