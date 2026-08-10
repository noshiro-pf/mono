import { type NumTiles, type Turn } from './enum';
import { type Tile } from './tile';

export type ApiMeldedBlock = Readonly<{
  /**
   * |  key   | value | description |
   * | :----: | :---: | :---------: |
   * |  Pon   |   0   |    ポン     |
   * |   Ti   |   1   |    チー     |
   * | Ankan  |   2   |    暗槓     |
   * | Minkan |   3   |    明槓     |
   * | Kakan  |   4   |    加槓     |
   */
  type: UintRange<0, 5>;

  tiles: ArrayAtLeastLen<3, Tile['no']>;

  /* 1個目の牌を鳴いたことにする */
  discardedTile: Tile['no'];

  /* 上家から鳴いたことにする */
  from: 3;
}>;

/**
 * ```json
 * {
 *   "version": "0.9.0",
 *   "zikaze": 27,
 *   "bakaze": 27,
 *   "turn": 3,
 *   "syanten_type": 1,
 *   "dora_indicators": [27],
 *   "flag": 63,
 *   "hand_tiles": [1, 1, 1, 4, 5, 6, 11, 12, 20, 20, 23, 23, 24, 30],
 *   "melded_blocks": [],
 *   "counts": [
 *     4, 1, 4, 4, 3, 3, 3, 4, 4, 4, 4, 3, 3, 4, 4, 4, 4, 4, 4, 4, 2, 4, 4,
 *     2, 3, 4, 4, 3, 4, 4, 3, 4, 4, 4, 1, 1, 1
 *   ]
 * }
 * ```
 */
export type ApiPayload = Readonly<{
  version: string;

  /**
   * API 側では Tile 定義を流用している
   *
   *     27: 東
   *     28: 南
   *     29: 西
   *     30: 北
   */
  zikaze: Extract<Tile['no'], 27 | 28 | 29 | 30>;

  /**
   * API 側では Tile 定義を流用している
   *
   *     27: 東
   *     28: 南
   */
  bakaze: Extract<Tile['no'], 27 | 28>;

  turn: Turn;

  /**
   * シャンテンタイプ
   *
   *     Normal: 1 一般手
   *     Tiitoi: 2 七対子手
   *     Kokusi: 4 国士無双手
   */
  syanten_type: 1 | 2 | 4;

  dora_indicators: readonly Tile['no'][];
  flag: number;
  hand_tiles: readonly Tile['no'][];
  melded_blocks: readonly ApiMeldedBlock[];
  counts: ArrayOfLength<37, NumTiles>;
}>;
