import {
  combine,
  createBooleanState,
  createState,
  map,
  type InitializedObservable,
} from 'synstate';
import { useObservableValue } from 'synstate-preact-hooks';
import { Arr, castMutable, Optional, type Result } from 'ts-data-forge';
import {
  type JsonValue,
  type MutableRecord,
  type ReadonlyRecord,
} from 'ts-type-forge';
import { tileDef } from '../constants/index.mjs';
import {
  hand2TenhoString,
  problem2String,
  revealedBlockToTiles,
  sortTiles,
} from '../functions/index.mjs';
import {
  type Bakaze,
  type DoraIndicatorPosition,
  type Jikaze,
  type MaximizeTarget,
  type NumTiles,
  type RevealedBlock,
  type TehaiType,
  type TileName,
  type Turn,
} from '../types/index.mjs';
import { getShuffled } from '../utils/index.mjs';

// 手牌
export const [
  hand$,
  setHand,
  { updateState: updateHand, resetState: resetHand },
] = createState<readonly TileName[]>([]);

// ドラ表示牌
export const [
  doraIndicators$,
  setDoraIndicators,
  { updateState: updateDoraIndicators, resetState: resetDoraIndicators },
] = createState<readonly TileName[]>(['Ton']);

// 鳴き面子
export const [
  revealedBlocks$,
  setRevealedBlocks,
  { updateState: updateRevealedBlocks, resetState: resetRevealedBlocks },
] = createState<readonly RevealedBlock[]>([]);

export const [isCalculating$, { setState: setIsCalculating }] =
  createBooleanState(false);

export const [result$, setResult, { resetState: resetResult }] = createState<
  | Result<
      JsonValue,
      Readonly<{
        type:
          | 'bakaze-is-undefined'
          | 'doraIndicators-is-undefined'
          | 'fetch-error'
          | 'flagOptions-is-undefined'
          | 'hand-is-undefined'
          | 'jikaze-is-undefined'
          | 'maximizeTarget-is-undefined'
          | 'numRemainingTiles-is-undefined'
          | 'revealedBlocks-is-undefined'
          | 'tehaiType-is-undefined'
          | 'turn-is-undefined';
        message: string;
      }>
    >
  | undefined
>(undefined);

const [
  bakaze$,
  setBakaze,
  { getSnapshot: getBakazeSnapshot, resetState: resetBakaze },
] = createState<Bakaze>('Ton');

const useBakaze = (): Bakaze => useObservableValue(bakaze$);

const useJikaze = (): Jikaze => useObservableValue(jikaze$);

const useTehaiType = (): TehaiType => useObservableValue(tehaiType$);

export { getBakazeSnapshot, setBakaze, useBakaze };

const [
  jikaze$,
  setJikaze,
  { getSnapshot: getJikazeSnapshot, resetState: resetJikaze },
] = createState<Jikaze>('Ton');

export { getJikazeSnapshot, setJikaze, useJikaze };

const [
  tehaiType$,
  setTehaiType,
  { getSnapshot: getTehaiTypeSnapshot, resetState: resetTehaiType },
] = createState<TehaiType>('normal');

export { getTehaiTypeSnapshot, setTehaiType, useTehaiType };

export const [turn$, setTurn, { resetState: resetTurn }] = createState<Turn>(3);

export const [flagOptions$, setFlagOptions, { resetState: resetFlagOptions }] =
  createState<
    ReadonlyRecord<
      | 'akahaiTsumo'
      | 'doubleReach'
      | 'haitei'
      | 'ippatsu'
      | 'shantenModoshi'
      | 'tegawari'
      | 'uradora',
      boolean
    >
  >({
    akahaiTsumo: true,
    doubleReach: true,
    haitei: true,
    ippatsu: true,
    shantenModoshi: true,
    tegawari: true,
    uradora: true,
  });

export const [
  maximizeTarget$,
  setMaximizeTarget,
  { resetState: resetMaximizeTarget },
] = createState<MaximizeTarget>('exp');

/* calculated values */

export const handSorted$ = hand$.pipe(map(sortTiles));

// 手牌の枚数
export const numHandTiles$ = combine([handSorted$, revealedBlocks$]).pipe(
  map(([hand, revealedBlocks]) => hand.length + revealedBlocks.length * 3),
);

// ドラの枚数
export const numDoraTiles$ = doraIndicators$.pipe(map((a) => a.length));

// 残りの牌の枚数
export const numRemainingTiles$: InitializedObservable<
  ReadonlyRecord<TileName, NumTiles>
> = combine([handSorted$, doraIndicators$, revealedBlocks$]).pipe(
  map(([hand, doraIndicators, revealedBlocks]) => {
    const mut_counts: MutableRecord<TileName, NumTiles> = {
      Manzu1: 4,
      Manzu2: 4,
      Manzu3: 4,
      Manzu4: 4,
      Manzu5: 3,
      Manzu6: 4,
      Manzu7: 4,
      Manzu8: 4,
      Manzu9: 4,
      Pinzu1: 4,
      Pinzu2: 4,
      Pinzu3: 4,
      Pinzu4: 4,
      Pinzu5: 3,
      Pinzu6: 4,
      Pinzu7: 4,
      Pinzu8: 4,
      Pinzu9: 4,
      Sozu1: 4,
      Sozu2: 4,
      Sozu3: 4,
      Sozu4: 4,
      Sozu5: 3,
      Sozu6: 4,
      Sozu7: 4,
      Sozu8: 4,
      Sozu9: 4,
      Ton: 4,
      Nan: 4,
      Sha: 4,
      Pei: 4,
      Haku: 4,
      Hatsu: 4,
      Chun: 4,
      AkaManzu5: 1,
      AkaPinzu5: 1,
      AkaSozu5: 1,
    };

    // ドラ表示牌を除く
    for (const tile of doraIndicators) {
      mut_counts[tile] -= 1;
    }

    // 手牌を除く
    for (const tile of hand) {
      mut_counts[tile] -= 1;
    }

    // 副露ブロックを除く
    for (const block of revealedBlocks) {
      for (const tile of revealedBlockToTiles(block)) {
        mut_counts[tile] -= 1;
      }
    }

    return mut_counts;
  }),
);

// 「天鳳 / 牌理」の URL
export const tenhoURL$ = handSorted$.pipe(
  map((hand) => `https://tenhou.net/2/?q=${hand2TenhoString(hand)}`),
);

// 「ツモアガリ確率計算機」用の文字列
export const tsumoProbStr$ = handSorted$.pipe(
  map((hand) => hand.map((x) => tileDef[x].TsumoProbString).join(',')),
);

export const problemAsText$ = combine([
  bakaze$,
  jikaze$,
  turn$,
  doraIndicators$,
  hand$,
  revealedBlocks$,
]).pipe(
  map(([bakaze, jikaze, turn, doraIndicators, hand, revealedBlocks]) =>
    problem2String(bakaze, jikaze, turn, doraIndicators, hand, revealedBlocks),
  ),
);

/* handlers */

// 手牌を初期化する。
export const clearHand = (): void => {
  resetHand();

  resetRevealedBlocks();

  resetResult();
};

// 設定を初期化する。
export const resetAll = (): void => {
  resetBakaze();

  resetJikaze();

  resetTehaiType();

  resetTurn();

  resetDoraIndicators();

  resetFlagOptions();

  resetMaximizeTarget();

  resetHand();

  resetRevealedBlocks();

  resetResult();
};

// 牌を手牌に追加する。
export const addTile2Hand = (tile: TileName): void => {
  updateHand(Arr.toPushed(tile));
};

// 牌を手牌から削除する。
export const removeTileFromHand = (tile: TileName): void => {
  updateHand((hand) => hand.toSpliced(hand.indexOf(tile, 1)));
};

// 牌を副露ブロックの一覧に追加する。
export const addRevealedBlock = (block: RevealedBlock): void => {
  updateRevealedBlocks(Arr.toPushed(block));
};

// 牌を副露ブロックの一覧から削除する。
export const removeRevealedBlock = (block: RevealedBlock): void => {
  updateRevealedBlocks((blocks) => blocks.toSpliced(blocks.indexOf(block, 1)));
};

// 牌をドラ表示牌の一覧に追加する。
export const addDora = (tile: TileName): void => {
  updateDoraIndicators(Arr.toPushed(tile));
};

// 牌をドラ表示牌の一覧から削除する。
export const removeDora = (index: DoraIndicatorPosition): void => {
  updateDoraIndicators((tiles) => tiles.toSpliced(index, 1));
};

// 牌山を作成する。
const allTiles: readonly TileName[] = [
  Arr.newArray(4, 'Manzu1' as const),
  Arr.newArray(4, 'Manzu2' as const),
  Arr.newArray(4, 'Manzu3' as const),
  Arr.newArray(4, 'Manzu4' as const),
  Arr.newArray(3, 'Manzu5' as const),
  'AkaManzu5' as const,
  Arr.newArray(4, 'Manzu6' as const),
  Arr.newArray(4, 'Manzu7' as const),
  Arr.newArray(4, 'Manzu8' as const),
  Arr.newArray(4, 'Manzu9' as const),
  Arr.newArray(4, 'Pinzu1' as const),
  Arr.newArray(4, 'Pinzu2' as const),
  Arr.newArray(4, 'Pinzu3' as const),
  Arr.newArray(4, 'Pinzu4' as const),
  Arr.newArray(3, 'Pinzu5' as const),
  'AkaPinzu5' as const,
  Arr.newArray(4, 'Pinzu6' as const),
  Arr.newArray(4, 'Pinzu7' as const),
  Arr.newArray(4, 'Pinzu8' as const),
  Arr.newArray(4, 'Pinzu9' as const),
  Arr.newArray(4, 'Sozu1' as const),
  Arr.newArray(4, 'Sozu2' as const),
  Arr.newArray(4, 'Sozu3' as const),
  Arr.newArray(4, 'Sozu4' as const),
  Arr.newArray(3, 'Sozu5' as const),
  'AkaSozu5' as const,
  Arr.newArray(4, 'Sozu6' as const),
  Arr.newArray(4, 'Sozu7' as const),
  Arr.newArray(4, 'Sozu8' as const),
  Arr.newArray(4, 'Sozu9' as const),
  Arr.newArray(4, 'Ton' as const),
  Arr.newArray(4, 'Nan' as const),
  Arr.newArray(4, 'Sha' as const),
  Arr.newArray(4, 'Pei' as const),
  Arr.newArray(4, 'Haku' as const),
  Arr.newArray(4, 'Hatsu' as const),
  Arr.newArray(4, 'Chun' as const),
].flat();

// ランダムな手牌を設定する。
export const setRandomHand = (): void => {
  const mut_yama = castMutable(Arr.copy(allTiles));

  // ドラ表示牌は削除する。
  const doraIndicators = doraIndicators$.getSnapshot();

  if (Optional.isSome(doraIndicators)) {
    for (const tile of doraIndicators.value) {
      const i = mut_yama.indexOf(tile);

      mut_yama.splice(i, 1);
    }
  }

  const yama = getShuffled(mut_yama);

  // 先頭14枚を取り出す。
  const newHand = Arr.take(yama, 14);

  // 理牌する。
  sortTiles(newHand);

  // 手牌をクリアする。
  clearHand();

  setHand(newHand);
};
