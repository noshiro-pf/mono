import {
  type MaximizeTarget,
  type RevealedBlockType,
  type TehaiType,
} from '../types';

// 手牌の種類
export const tehaiTypeDef = {
  normal: { flag: 1, displayName: '一般手' },
  'Chi-toi': { flag: 2, displayName: '七対子手' },
  Kokushi: { flag: 4, displayName: '国士無双手' },
} as const satisfies Record<TehaiType, { flag: number; displayName: string }>;

export const flagOptionsDef = {
  shantenModoshi: { flag: 1, displayName: '向聴戻し' },
  tegawari: { flag: 2, displayName: '手変わり' },
  doubleReach: { flag: 4, displayName: 'ダブル立直' },
  ippatsu: { flag: 8, displayName: '一発' },
  haitei: { flag: 16, displayName: '海底自摸' },
  uradora: { flag: 32, displayName: '裏ドラ' },
  akahaiTsumo: { flag: 64, displayName: '赤牌自摸' },
} as const satisfies Record<string, { flag: number; displayName: string }>;

export const maximizeTargetDef = {
  exp: { flag: 0, displayName: '期待値最大化' },
  winProb: { flag: 128, displayName: '和了確率最大化' },
} as const satisfies Record<
  MaximizeTarget,
  { flag: number; displayName: string }
>;

export const revealedTileTypeDef = {
  Pon: { id: 0, displayName: 'ポン' },
  'Chi-': { id: 1, displayName: 'チー' },
  Ankan: { id: 2, displayName: '暗槓' },
  Minkan: { id: 3, displayName: '明槓' },
  Kakan: { id: 4, displayName: '加槓' },
} as const satisfies Record<
  RevealedBlockType,
  { id: number; displayName: string }
>;
