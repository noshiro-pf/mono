import type { AnswerSymbolPoint } from '../../enum';

export type SymbolSetting = Readonly<{
  description: string;
  point: AnswerSymbolPoint;
}>;

export type PartialSymbolSetting = Partial<SymbolSetting>;

export const defaultSymbolSetting: SymbolSetting = {
  description: '',
  point: 0,
} as const;

const d = defaultSymbolSetting;
export const fillSymbolSetting = (a: PartialSymbolSetting): SymbolSetting => ({
  description: a.description ?? d.description,
  point: a.point ?? d.point,
});