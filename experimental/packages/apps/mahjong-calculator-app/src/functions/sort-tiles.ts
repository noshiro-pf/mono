import { tileDef } from '../constants';
import { type TileName } from '../types';

export const sortTiles = (tiles: readonly TileName[]): readonly TileName[] =>
  tiles.toSorted((a, b) => tileDef[a].order - tileDef[b].order);
