import { tileDef } from '../constants';
import { type TileName } from '../types';

export const sortTiles = (tiles: readonly TileName[]): readonly TileName[] =>
  Arr.sorted(tiles, (a, b) => tileDef[a].order - tileDef[b].order);