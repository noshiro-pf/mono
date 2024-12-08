import { tileDef } from '../constants';
import { castToTileName, type NumTiles, type TileName } from '../types';
import { aka2Normal } from './hand-to-string';

export const toTiles34 = (
  tiles: Record<TileName, NumTiles> | readonly TileName[],
): ArrayOfLength<34, NumTiles> => {
  const mut_tiles34: MutableArrayOfLength<34, NumTiles> = Arr.asMut(
    Arr.zeros(34),
  );

  if (Array.isArray(tiles)) {
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
