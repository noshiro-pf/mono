import { getShuffled } from '@noshiro/ts-utils-additional';
import { tileDef } from '../constants';
import {
  hand2TenhoString,
  problem2String,
  revealedBlockToTiles,
  sortTiles,
} from '../functions';
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
} from '../types';

// 手牌
export const {
  state$: hand$,
  setState: setHand,
  updateState: updateHand,
  resetState: resetHand,
} = createState<readonly TileName[]>([]);

// ドラ表示牌
export const {
  state$: doraIndicators$,
  setState: setDoraIndicators,
  updateState: updateDoraIndicators,
  resetState: resetDoraIndicators,
} = createState<readonly TileName[]>(['Ton']);

// 鳴き面子
export const {
  state$: revealedBlocks$,
  setState: setRevealedBlocks,
  updateState: updateRevealedBlocks,
  resetState: resetRevealedBlocks,
} = createState<readonly RevealedBlock[]>([]);

export const { state$: isCalculating$, setState: setIsCalculating } =
  createState<boolean>(false);

export const {
  state$: result$,
  setState: setResult,
  resetState: resetResult,
} = createState<
  | Result<
      JSONValue,
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

export const {
  state$: bakaze$,
  setState: setBakaze,
  resetState: resetBakaze,
} = createState<Bakaze>('Ton');

export const {
  state$: jikaze$,
  setState: setJikaze,
  resetState: resetJikaze,
} = createState<Jikaze>('Ton');

export const {
  state$: tehaiType$,
  setState: setTehaiType,
  resetState: resetTehaiType,
} = createState<TehaiType>('normal');

export const {
  state$: turn$,
  setState: setTurn,
  resetState: resetTurn,
} = createState<Turn>(3);

export const {
  state$: flagOptions$,
  setState: setFlagOptions,
  resetState: resetFlagOptions,
} = createState<
  Record<
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

export const {
  state$: maximizeTarget$,
  setState: setMaximizeTarget,
  resetState: resetMaximizeTarget,
} = createState<MaximizeTarget>('exp');

/* calculated values */

export const handSorted$ = hand$.chain(mapI(sortTiles));

// 手牌の枚数
export const numHandTiles$ = combineLatestI([
  handSorted$,
  revealedBlocks$,
]).chain(
  mapI(([hand, revealedBlocks]) => hand.length + revealedBlocks.length * 3),
);

// ドラの枚数
export const numDoraTiles$ = doraIndicators$.chain(mapI((a) => a.length));

// 残りの牌の枚数
export const numRemainingTiles$: InitializedObservable<
  Record<TileName, NumTiles>
> = combineLatestI([handSorted$, doraIndicators$, revealedBlocks$]).chain(
  mapI(([hand, doraIndicators, revealedBlocks]) => {
    const mut_counts: Writable<Record<TileName, NumTiles>> = {
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
export const tenhoURL$ = handSorted$.chain(
  mapI((hand) => `https://tenhou.net/2/?q=${hand2TenhoString(hand)}`),
);

// 「ツモアガリ確率計算機」用の文字列
export const tsumoProbStr$ = handSorted$.chain(
  mapI((hand) => hand.map((x) => tileDef[x].TsumoProbString).join(',')),
);

export const problemAsText$ = combineLatestI([
  bakaze$,
  jikaze$,
  turn$,
  doraIndicators$,
  hand$,
  revealedBlocks$,
]).chain(
  mapI(([bakaze, jikaze, turn, doraIndicators, hand, revealedBlocks]) =>
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
  updateHand((hand) => Arr.pushed(hand, tile));
};

// 牌を手牌から削除する。
export const removeTileFromHand = (tile: TileName): void => {
  updateHand((hand) => Arr.removed(hand, hand.indexOf(tile)));
};

// 牌を副露ブロックの一覧に追加する。
export const addRevealedBlock = (block: RevealedBlock): void => {
  updateRevealedBlocks((blocks) => Arr.pushed(blocks, block));
};

// 牌を副露ブロックの一覧から削除する。
export const removeRevealedBlock = (block: RevealedBlock): void => {
  updateRevealedBlocks((blocks) => Arr.removed(blocks, blocks.indexOf(block)));
};

// 牌をドラ表示牌の一覧に追加する。
export const addDora = (tile: TileName): void => {
  updateDoraIndicators((tiles) => Arr.pushed(tiles, tile));
};

// 牌をドラ表示牌の一覧から削除する。
export const removeDora = (index: DoraIndicatorPosition): void => {
  updateDoraIndicators((tiles) => Arr.removed(tiles, index));
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
  const mut_yama = pipe(Arr.copy(allTiles)).chain(Arr.asMut).value;

  // ドラ表示牌は削除する。
  const doraIndicators = doraIndicators$.snapshot;
  if (Maybe.isSome(doraIndicators)) {
    for (const tile of doraIndicators.value) {
      const i = mut_yama.indexOf(tile);
      mut_yama.splice(i, 1);
    }
  }

  const yama = getShuffled(mut_yama);

  // 先頭14枚を取り出す。
  const newHand = yama.slice(0, 14);

  // 理牌する。
  sortTiles(newHand);

  // 手牌をクリアする。
  clearHand();

  setHand(newHand);
};
