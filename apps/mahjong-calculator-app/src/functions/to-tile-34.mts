import { Arr, castMutable } from 'ts-data-forge';
import {
  type FixedLengthTuple,
  type MutableFixedLengthTuple,
  type ReadonlyRecord,
} from 'ts-type-forge';
import { tileDef } from '../constants/index.mjs';
import {
  castToTileName,
  type NumTiles,
  type TileName,
} from '../types/index.mjs';
import { aka2Normal } from './hand-to-string.mjs';

export const toTiles34 = (
  tiles: ReadonlyRecord<TileName, NumTiles> | readonly TileName[],
): FixedLengthTuple<34, NumTiles> => {
  const mut_tiles34: MutableFixedLengthTuple<34, NumTiles> = castMutable(
    Arr.zeros(34),
  );

  if (Arr.isArray(tiles)) {
    for (const tile of tiles) {
      mut_tiles34[tileDef[aka2Normal(tile)].no] += 1;
    }
  } else {
    for (const [tileName, num] of Object.entries(tiles)) {
      mut_tiles34[tileDef[aka2Normal(castToTileName(tileName))].no] += num;
    }
  }

  return mut_tiles34;
};
