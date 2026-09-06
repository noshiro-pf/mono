import { Arr, Optional, Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { doraHyouji2Dora } from '../constants/index.mjs';
import { aka2Normal, hand2String, toTiles34 } from '../functions/index.mjs';
import {
  doraIndicators$,
  handSorted$,
  numRemainingTiles$,
  turn$,
} from '../store/index.mjs';
import { type NumTiles, type TileName, type Turn } from '../types/index.mjs';
import { downloadFile } from '../utils/index.mjs';

export const toHMRFormatText = ({
  turn,
  numRemainingTiles,
  hand,
  doraIndicators,
}: Readonly<{
  turn: Turn;
  numRemainingTiles: ReadonlyRecord<TileName, NumTiles>;
  hand: readonly TileName[];
  doraIndicators: readonly TileName[];
}>): Result<
  string,
  Readonly<{ type: 'doraIndicators-is-empty' } | { type: 'hand-is-empty' }>
> => {
  const handLastTile = hand.at(-1);

  if (handLastTile === undefined) {
    return Result.err({ type: 'hand-is-empty' } as const);
  }

  const firstDraIndicator = Arr.head(doraIndicators);

  // `Arr.head` returns an `Optional` now, not `T | undefined`.
  if (Optional.isNone(firstDraIndicator)) {
    return Result.err({ type: 'doraIndicators-is-empty' } as const);
  }

  // 右端の牌をツモ牌扱いにする
  const tsumoTile = aka2Normal(handLastTile);

  const text = [
    // 1行目: "<巡目> <自摸牌>"
    `${turn} ${tsumoTile}`,
    // 2行目: 各牌の残り枚数
    toTiles34(numRemainingTiles).join(''),
    // 3行目: 手牌の各牌の枚数
    toTiles34(hand).join(''),
    // 4行目: ドラ（※槓ドラ非対応）
    toTiles34([doraHyouji2Dora[firstDraIndicator.value]]).join(''),
    // 5行目: 捨牌
    Arr.newArray(18, -1).join(''),
  ].join('\n');

  return Result.ok(text);
};

/**
 * 牌姿を一人麻雀練習機形式でダウンロードする。
 *
 * @example
 *   ```txt
 *   3 24
 *   4444243432414444444444141444444444
 *   0000101012030000000000303000000000
 *   0000010000000000000000000000000000
 *   -1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1
 *   ```;
 */
export const downloadHMRFormatText = (): Result<
  undefined,
  Readonly<
    | { type: 'doraIndicators-is-empty' }
    | { type: 'doraIndicators-is-undefined' }
    | { type: 'hand-is-empty' }
    | { type: 'hand-is-undefined' }
    | { type: 'numRemainingTiles-is-undefined' }
    | { type: 'turn-is-undefined' }
  >
> => {
  const maybeHand = handSorted$.getSnapshot();

  if (Optional.isNone(maybeHand)) {
    return Result.err({ type: 'hand-is-undefined' });
  }

  const maybeTurn = turn$.getSnapshot();

  if (Optional.isNone(maybeTurn)) {
    return Result.err({ type: 'turn-is-undefined' });
  }

  const maybeDoraIndicators = doraIndicators$.getSnapshot();

  if (Optional.isNone(maybeDoraIndicators)) {
    return Result.err({ type: 'doraIndicators-is-undefined' });
  }

  const maybeNumRemainingTiles = numRemainingTiles$.getSnapshot();

  if (Optional.isNone(maybeNumRemainingTiles)) {
    return Result.err({ type: 'numRemainingTiles-is-undefined' });
  }

  const hand = maybeHand.value;

  const turn = maybeTurn.value;

  const doraIndicators = maybeDoraIndicators.value;

  const numRemainingTiles = maybeNumRemainingTiles.value;

  const result = toHMRFormatText({
    turn,
    numRemainingTiles,
    hand,
    doraIndicators,
  });

  if (Result.isErr(result)) {
    return result;
  }

  const text = result.value;

  const blob = new Blob([text], { type: 'text/plain' });

  const url = URL.createObjectURL(blob);

  downloadFile(url, `${hand2String(hand, [])}.hmr`);

  URL.revokeObjectURL(url);

  return Result.ok(undefined);
};
