import { type DeepPartial, type ReadonlyRecord } from 'ts-type-forge';
import { type AnswerSymbolId } from '../enum/index.mjs';
import { fillSymbolSetting, type SymbolSetting } from './base/index.mjs';

export type SymbolSettings = ReadonlyRecord<AnswerSymbolId, SymbolSetting>;

export type PartialSymbolSettings = DeepPartial<SymbolSettings>;

const defaultSymbolSettings = {
  good: { description: '', point: 10 },
  fair: { description: '', point: 6 },
  poor: { description: '', point: 0 },
} as const satisfies SymbolSettings;

const d = defaultSymbolSettings;

export const fillSymbolSettings = (p?: PartialSymbolSettings): SymbolSettings =>
  ({
    good: fillSymbolSetting(p?.good ?? d.good),
    fair: fillSymbolSetting(p?.fair ?? d.fair),
    poor: fillSymbolSetting(p?.poor ?? d.poor),
  }) as const;
