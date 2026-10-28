/**
 * 計算機の状態: 問題の設定（場風・自風・巡目・ドラ表示牌・手牌・副露）、
 * 計算の進み具合と結果、そこから計算される値、それを書き換える action。
 *
 * ブラウザにも外部にも触れない。乱数だけは `deps.shuffle` で受け取るので、
 * テストでは決まった順に並べる関数を渡せる。
 */

import {
  combine,
  createBooleanState,
  createState,
  map,
  type InitializedObservable,
} from 'synstate';
import { Arr, castMutable, type Result } from 'ts-data-forge';
import type { JsonValue, MutableRecord, ReadonlyRecord } from 'ts-type-forge';
import { tileDef } from '../constants/index.mjs';
import {
  hand2TenhoString,
  problem2String,
  revealedBlockToTiles,
  sortTiles,
} from '../functions/index.mjs';
import type {
  Bakaze,
  DoraIndicatorPosition,
  Jikaze,
  MaximizeTarget,
  NumTiles,
  RevealedBlock,
  TehaiType,
  TileName,
  Turn,
} from '../types/index.mjs';

export type CalculatorDeps = Readonly<{
  /** 牌山を混ぜる。`setRandomHand` は混ぜた先頭 14 枚を手牌にする。 */
  shuffle: (tiles: readonly TileName[]) => readonly TileName[];
}>;

export type CalculationResult =
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
  | undefined;

export type FlagOptions = ReadonlyRecord<
  | 'akahaiTsumo'
  | 'doubleReach'
  | 'haitei'
  | 'ippatsu'
  | 'shantenModoshi'
  | 'tegawari'
  | 'uradora',
  boolean
>;

export type CalculatorStore = Readonly<{
  /** 手牌 */
  hand: InitializedObservable<readonly TileName[]>;
  setHand: (hand: readonly TileName[]) => void;
  /** ドラ表示牌 */
  doraIndicators: InitializedObservable<readonly TileName[]>;
  setDoraIndicators: (tiles: readonly TileName[]) => void;
  /** 鳴き面子 */
  revealedBlocks: InitializedObservable<readonly RevealedBlock[]>;
  setRevealedBlocks: (blocks: readonly RevealedBlock[]) => void;
  isCalculating: InitializedObservable<boolean>;
  setIsCalculating: (isCalculating: boolean) => void;
  result: InitializedObservable<CalculationResult>;
  setResult: (result: CalculationResult) => void;
  resetResult: () => void;
  bakaze: InitializedObservable<Bakaze>;
  setBakaze: (bakaze: Bakaze) => void;
  jikaze: InitializedObservable<Jikaze>;
  setJikaze: (jikaze: Jikaze) => void;
  tehaiType: InitializedObservable<TehaiType>;
  setTehaiType: (tehaiType: TehaiType) => void;
  turn: InitializedObservable<Turn>;
  setTurn: (turn: Turn) => void;
  flagOptions: InitializedObservable<FlagOptions>;
  setFlagOptions: (flagOptions: FlagOptions) => void;
  maximizeTarget: InitializedObservable<MaximizeTarget>;
  setMaximizeTarget: (maximizeTarget: MaximizeTarget) => void;

  /** 理牌した手牌 */
  handSorted: InitializedObservable<readonly TileName[]>;
  /** 手牌の枚数 */
  numHandTiles: InitializedObservable<number>;
  /** ドラの枚数 */
  numDoraTiles: InitializedObservable<number>;
  /** 残りの牌の枚数 */
  numRemainingTiles: InitializedObservable<ReadonlyRecord<TileName, NumTiles>>;
  /** 「天鳳 / 牌理」の URL */
  tenhoURL: InitializedObservable<string>;
  /** 「ツモアガリ確率計算機」用の文字列 */
  tsumoProbStr: InitializedObservable<string>;
  problemAsText: InitializedObservable<string>;

  /** 手牌を初期化する。 */
  clearHand: () => void;
  /** 設定を初期化する。 */
  resetAll: () => void;
  /** 牌を手牌に追加する。 */
  addTile2Hand: (tile: TileName) => void;
  /** 牌を手牌から削除する。 */
  removeTileFromHand: (tile: TileName) => void;
  /** 牌を副露ブロックの一覧に追加する。 */
  addRevealedBlock: (block: RevealedBlock) => void;
  /** 牌を副露ブロックの一覧から削除する。 */
  removeRevealedBlock: (block: RevealedBlock) => void;
  /** 牌をドラ表示牌の一覧に追加する。 */
  addDora: (tile: TileName) => void;
  /** 牌をドラ表示牌の一覧から削除する。 */
  removeDora: (index: DoraIndicatorPosition) => void;
  /** ドラ表示牌を除いた牌山から、ランダムな手牌を設定する。 */
  setRandomHand: () => void;
}>;

export const createCalculatorStore = (
  deps: CalculatorDeps,
): CalculatorStore => {
  const [hand, setHand, { updateState: updateHand, resetState: resetHand }] =
    createState<readonly TileName[]>([]);

  const [
    doraIndicators,
    setDoraIndicators,
    {
      updateState: updateDoraIndicators,
      resetState: resetDoraIndicators,
      getSnapshot: getDoraIndicators,
    },
  ] = createState<readonly TileName[]>(['Ton']);

  const [
    revealedBlocks,
    setRevealedBlocks,
    { updateState: updateRevealedBlocks, resetState: resetRevealedBlocks },
  ] = createState<readonly RevealedBlock[]>([]);

  const [isCalculating, { setState: setIsCalculating }] =
    createBooleanState(false);

  const [result, setResult, { resetState: resetResult }] =
    createState<CalculationResult>(undefined);

  const [bakaze, setBakaze, { resetState: resetBakaze }] =
    createState<Bakaze>('Ton');

  const [jikaze, setJikaze, { resetState: resetJikaze }] =
    createState<Jikaze>('Ton');

  const [tehaiType, setTehaiType, { resetState: resetTehaiType }] =
    createState<TehaiType>('normal');

  const [turn, setTurn, { resetState: resetTurn }] = createState<Turn>(3);

  const [flagOptions, setFlagOptions, { resetState: resetFlagOptions }] =
    createState<FlagOptions>({
      akahaiTsumo: true,
      doubleReach: true,
      haitei: true,
      ippatsu: true,
      shantenModoshi: true,
      tegawari: true,
      uradora: true,
    });

  const [
    maximizeTarget,
    setMaximizeTarget,
    { resetState: resetMaximizeTarget },
  ] = createState<MaximizeTarget>('exp');

  /* calculated values */

  const handSorted = hand.pipe(map(sortTiles));

  const numHandTiles = combine([handSorted, revealedBlocks]).pipe(
    map(([handTiles, blocks]) => handTiles.length + blocks.length * 3),
  );

  const numDoraTiles = doraIndicators.pipe(map((a) => a.length));

  const numRemainingTiles = combine([
    handSorted,
    doraIndicators,
    revealedBlocks,
  ]).pipe(
    map(([handTiles, indicators, blocks]) =>
      countRemainingTiles(handTiles, indicators, blocks),
    ),
  );

  const tenhoURL = handSorted.pipe(
    map(
      (handTiles) => `https://tenhou.net/2/?q=${hand2TenhoString(handTiles)}`,
    ),
  );

  const tsumoProbStr = handSorted.pipe(
    map((handTiles) =>
      handTiles.map((x) => tileDef[x].TsumoProbString).join(','),
    ),
  );

  const problemAsText = combine([
    bakaze,
    jikaze,
    turn,
    doraIndicators,
    hand,
    revealedBlocks,
  ]).pipe(
    map(([b, j, t, indicators, handTiles, blocks]) =>
      problem2String(b, j, t, indicators, handTiles, blocks),
    ),
  );

  /* handlers */

  const clearHand = (): void => {
    resetHand();

    resetRevealedBlocks();

    resetResult();
  };

  const resetAll = (): void => {
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

  const addTile2Hand = (tile: TileName): void => {
    updateHand(Arr.toPushed(tile));
  };

  const removeTileFromHand = (tile: TileName): void => {
    updateHand((tiles) => removeFirst(tiles, tile));
  };

  const addRevealedBlock = (block: RevealedBlock): void => {
    updateRevealedBlocks(Arr.toPushed(block));
  };

  const removeRevealedBlock = (block: RevealedBlock): void => {
    updateRevealedBlocks((blocks) => removeFirst(blocks, block));
  };

  const addDora = (tile: TileName): void => {
    updateDoraIndicators(Arr.toPushed(tile));
  };

  const removeDora = (index: DoraIndicatorPosition): void => {
    updateDoraIndicators((tiles) => tiles.toSpliced(index, 1));
  };

  const setRandomHand = (): void => {
    const mut_yama = castMutable(Arr.copy(allTiles));

    // ドラ表示牌は削除する。
    for (const tile of getDoraIndicators()) {
      const i = mut_yama.indexOf(tile);

      mut_yama.splice(i, 1);
    }

    const yama = deps.shuffle(mut_yama);

    // 先頭14枚を取り出す。
    const newHand = Arr.take(yama, 14);

    // 手牌をクリアする。
    clearHand();

    setHand(newHand);
  };

  return {
    hand,
    setHand,
    doraIndicators,
    setDoraIndicators,
    revealedBlocks,
    setRevealedBlocks,
    isCalculating,
    setIsCalculating,
    result,
    setResult,
    resetResult,
    bakaze,
    setBakaze,
    jikaze,
    setJikaze,
    tehaiType,
    setTehaiType,
    turn,
    setTurn,
    flagOptions,
    setFlagOptions,
    maximizeTarget,
    setMaximizeTarget,
    handSorted,
    numHandTiles,
    numDoraTiles,
    numRemainingTiles,
    tenhoURL,
    tsumoProbStr,
    problemAsText,
    clearHand,
    resetAll,
    addTile2Hand,
    removeTileFromHand,
    addRevealedBlock,
    removeRevealedBlock,
    addDora,
    removeDora,
    setRandomHand,
  };
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

const countRemainingTiles = (
  hand: readonly TileName[],
  doraIndicators: readonly TileName[],
  revealedBlocks: readonly RevealedBlock[],
): ReadonlyRecord<TileName, NumTiles> => {
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
};

/** `array` without its first occurrence of `value`; unchanged if there is none. */
const removeFirst = <T,>(array: readonly T[], value: T): readonly T[] => {
  const index = array.indexOf(value);

  return index === -1 ? array : array.toSpliced(index, 1);
};
