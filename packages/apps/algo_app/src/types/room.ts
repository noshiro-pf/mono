import type { GameStateAction } from './game-state';

export type Room = Readonly<{
  id: string;
  actions: readonly GameStateAction[];
  players: ReadonlyArrayOfLength<4, string>;
  host: string | undefined;
}>;
