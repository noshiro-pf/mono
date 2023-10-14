import { doraHyouji2Dora, tileDef } from '../constants';
import {
  type Bakaze,
  type Jikaze,
  type RevealedBlock,
  type Shanten,
  type TileName,
  type Turn,
} from '../types';
import { revealedBlockToTiles } from './revealed-block-to-tiles';

export const hand2String = (
  handTiles: readonly TileName[],
  revealedBlocks: readonly RevealedBlock[],
): string => {
  let mut_str = '';

  mut_str += block2String(handTiles);

  if (revealedBlocks.length > 0) {
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

  for (const tile of tiles) {
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
        mut_manzu.push(tile);
        break;

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
        mut_pinzu.push(tile);
        break;

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
        mut_sozu.push(tile);
        break;

      case 'Ton':
      case 'Nan':
      case 'Sha':
      case 'Pei':
      case 'Haku':
      case 'Hatsu':
      case 'Chun':
        mut_jihai.push(tile);
        break;
    }
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
    manzu.length === 0
      ? ''
      : `${manzu.map((a) => tileDef[a].MPSString).join('')}m`,
    pinzu.length === 0
      ? ''
      : `${pinzu.map((a) => tileDef[a].MPSString).join('')}p`,
    sozu.length === 0
      ? ''
      : `${sozu.map((a) => tileDef[a].MPSString).join('')}p`,
    jihai.length === 0
      ? ''
      : `${jihai.map((a) => tileDef[a].MPSString).join('')}p`,
  ].join('');
};

export const hand2TenhoString = (sortedTiles: readonly TileName[]): string => {
  const { manzu, pinzu, sozu, jihai } = distributeTilesByType(sortedTiles);

  return [
    manzu.length === 0
      ? ''
      : `${manzu.map((a) => tileDef[a].TenhoMPSString).join('')}m`,
    pinzu.length === 0
      ? ''
      : `${pinzu.map((a) => tileDef[a].TenhoMPSString).join('')}p`,
    sozu.length === 0
      ? ''
      : `${sozu.map((a) => tileDef[a].TenhoMPSString).join('')}p`,
    jihai.length === 0
      ? ''
      : `${jihai.map((a) => tileDef[a].TenhoMPSString).join('')}p`,
  ].join('');
};

export const revealedBlock2String = (revealedBlock: RevealedBlock): string =>
  `[${block2String(revealedBlockToTiles(revealedBlock))}]`;

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

  if (doraIndicators.length > 0) {
    mut_str += `ドラ: ${tiles2string(
      doraIndicators.map((a) => doraHyouji2Dora[a]),
    )}`;
  }
  mut_str += '\n';
  mut_str += `${hand2String(handTiles, revealedBlocks)}`;

  return mut_str;
};

export const aka2Normal = (
  tile: TileName,
): Exclude<TileName, 'AkaManzu5' | 'AkaPinzu5' | 'AkaSozu5'> => {
  switch (tile) {
    case 'AkaManzu5':
      return 'Manzu5';
    case 'AkaPinzu5':
      return 'Pinzu5';
    case 'AkaSozu5':
      return 'Sozu5';
    default:
      return tile;
  }
};

export const shanten2String = (
  shanten: Shanten,
): '和了' | '聴牌' | `${Shanten}向聴` =>
  shanten === -1 ? '和了' : shanten === 0 ? '聴牌' : `${shanten}向聴`;
