import { Arr } from 'ts-data-forge';
import {
  type DeepReadonly,
  type ReadonlyRecord,
  type StrictExclude,
} from 'ts-type-forge';
import { dict, doraHyouji2Dora, tileDef } from '../constants/index.mjs';
import {
  type Bakaze,
  type Jikaze,
  type RevealedBlock,
  type Shanten,
  type TileName,
  type Turn,
} from '../types/index.mjs';
import { revealedBlockToTiles } from './revealed-block-to-tiles.mjs';

type Suit = 'jihai' | 'manzu' | 'pinzu' | 'sozu';

/**
 * Which bucket a tile belongs in.
 *
 * Extracted from the loop below: `unicorn/no-break-in-nested-loop` rejects a
 * `switch` with `break`s inside a loop, and its message says to move it into a
 * function.
 */
const suitOf = (tile: TileName): Suit => {
  switch (tile) {
    case 'Manzu1':
    case 'Manzu2':
    case 'Manzu3':
    case 'Manzu4':
    case 'Manzu5':
    case 'Manzu6':
    case 'Manzu7':
    case 'Manzu8':
    case 'Manzu9':
    case 'AkaManzu5':
      return 'manzu';

    case 'Pinzu1':
    case 'Pinzu2':
    case 'Pinzu3':
    case 'Pinzu4':
    case 'Pinzu5':
    case 'Pinzu6':
    case 'Pinzu7':
    case 'Pinzu8':
    case 'Pinzu9':
    case 'AkaPinzu5':
      return 'pinzu';

    case 'Sozu1':
    case 'Sozu2':
    case 'Sozu3':
    case 'Sozu4':
    case 'Sozu5':
    case 'Sozu6':
    case 'Sozu7':
    case 'Sozu8':
    case 'Sozu9':
    case 'AkaSozu5':
      return 'sozu';

    case 'Ton':
    case 'Nan':
    case 'Sha':
    case 'Pei':
    case 'Haku':
    case 'Hatsu':
    case 'Chun':
      return 'jihai';
  }
};

export const hand2String = (
  handTiles: readonly TileName[],
  revealedBlocks: readonly RevealedBlock[],
): string => {
  let mut_str = '';

  mut_str += block2String(handTiles);

  if (Arr.isNonEmpty(revealedBlocks)) {
    mut_str += ` ${revealedBlocks.map(revealedBlock2String).join('')}`;
  }

  return mut_str;
};

const distributeTilesByType = (
  tiles: readonly TileName[],
): DeepReadonly<{
  manzu: TileName[];
  pinzu: TileName[];
  sozu: TileName[];
  jihai: TileName[];
}> => {
  const mut_manzu: TileName[] = [];

  const mut_pinzu: TileName[] = [];

  const mut_sozu: TileName[] = [];

  const mut_jihai: TileName[] = [];

  // Named `mut_` because the arrays behind it are the mutable accumulators
  // above; the record itself is only a lookup from suit to one of them.
  const mut_buckets: Readonly<ReadonlyRecord<Suit, TileName[]>> = {
    manzu: mut_manzu,
    pinzu: mut_pinzu,
    sozu: mut_sozu,
    jihai: mut_jihai,
  };

  for (const tile of tiles) {
    mut_buckets[suitOf(tile)].push(tile);
  }

  return {
    manzu: mut_manzu,
    pinzu: mut_pinzu,
    sozu: mut_sozu,
    jihai: mut_jihai,
  };
};

export const block2String = (sortedTiles: readonly TileName[]): string => {
  const { manzu, pinzu, sozu, jihai } = distributeTilesByType(sortedTiles);

  return [
    Arr.isEmpty(manzu)
      ? ''
      : `${manzu.map((a) => tileDef[a].MPSString).join('')}m`,
    Arr.isEmpty(pinzu)
      ? ''
      : `${pinzu.map((a) => tileDef[a].MPSString).join('')}p`,
    Arr.isEmpty(sozu)
      ? ''
      : `${sozu.map((a) => tileDef[a].MPSString).join('')}p`,
    Arr.isEmpty(jihai)
      ? ''
      : `${jihai.map((a) => tileDef[a].MPSString).join('')}p`,
  ].join('');
};

export const hand2TenhoString = (sortedTiles: readonly TileName[]): string => {
  const { manzu, pinzu, sozu, jihai } = distributeTilesByType(sortedTiles);

  return [
    Arr.isEmpty(manzu)
      ? ''
      : `${manzu.map((a) => tileDef[a].TenhoMPSString).join('')}m`,
    Arr.isEmpty(pinzu)
      ? ''
      : `${pinzu.map((a) => tileDef[a].TenhoMPSString).join('')}p`,
    Arr.isEmpty(sozu)
      ? ''
      : `${sozu.map((a) => tileDef[a].TenhoMPSString).join('')}p`,
    Arr.isEmpty(jihai)
      ? ''
      : `${jihai.map((a) => tileDef[a].TenhoMPSString).join('')}p`,
  ].join('');
};

export const revealedBlock2String = (revealedBlock: RevealedBlock): string =>
  `[${block2String(revealedBlockToTiles(revealedBlock))}]` as const;

const tiles2string = (tiles: readonly TileName[]): string =>
  tiles.map((x) => tileDef[x].displayName).join(',');

export const problem2String = (
  bakaze: Bakaze,
  jikaze: Jikaze,
  turn: Turn,
  doraIndicators: readonly TileName[],
  handTiles: readonly TileName[],
  revealedBlocks: readonly RevealedBlock[],
): string => {
  let mut_str = '';

  mut_str += `${dict.bakaze[bakaze]}一局0本場 `;

  mut_str += `${dict.jikaze[jikaze]}家 `;

  mut_str += `${turn}巡目 `;

  if (Arr.isNonEmpty(doraIndicators)) {
    mut_str += `ドラ: ${tiles2string(
      doraIndicators.map((a) => doraHyouji2Dora[a]),
    )}`;
  }

  mut_str += '\n';

  mut_str += hand2String(handTiles, revealedBlocks);

  return mut_str;
};

export const aka2Normal = (
  tile: TileName,
): StrictExclude<TileName, 'AkaManzu5' | 'AkaPinzu5' | 'AkaSozu5'> =>
  tile === 'AkaManzu5'
    ? 'Manzu5'
    : tile === 'AkaPinzu5'
      ? 'Pinzu5'
      : tile === 'AkaSozu5'
        ? 'Sozu5'
        : tile;

export const shanten2String = (
  shanten: Shanten,
): '和了' | '聴牌' | `${Shanten}向聴` =>
  shanten === -1
    ? '和了'
    : shanten === 0
      ? '聴牌'
      : (`${shanten}向聴` as const);
