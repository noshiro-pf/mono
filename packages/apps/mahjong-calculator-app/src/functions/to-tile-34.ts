import { tileDef } from '../constants';
import { type NumTiles, type TileName } from '../types';
import { aka2Normal } from './hand-to-string';

export const toTiles34 = (
  tiles: Record<TileName, NumTiles> | readonly TileName[]
): ArrayOfLength<34, NumTiles> => {
  const mut_tiles34: MutableArrayOfLength<34, NumTiles> = Arr.asMut(
    Arr.zerosUnwrapped(34)
  );

  if (Arr.isArray(tiles)) {
    for (const tile of tiles) {
      mut_tiles34[tileDef[aka2Normal(tile)].no as UintRange<0, 33>] += 1;
    }
  } else {
    for (const [tileName, num] of Obj.entries(tiles)) {
      mut_tiles34[tileDef[aka2Normal(tileName)].no as UintRange<0, 33>] += num;
    }
  }

  return mut_tiles34;
};
