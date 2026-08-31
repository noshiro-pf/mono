import { tileDef } from '../constants/index.mjs';
import { type TileName } from '../types/index.mjs';

export const sortTiles = (tiles: readonly TileName[]): readonly TileName[] =>
  tiles.toSorted((a, b) => tileDef[a].order - tileDef[b].order);
