import { defineRoutes, search, type Href } from 'synstate-router';

/**
 * Every page of the app. The room is a search parameter of the rooms page, and
 * the player too once they have joined: see `route-paths.mts` for why.
 */
export const routes = defineRoutes({
  main: { segment: '' },
  createRoom: { segment: 'create' },
  rooms: {
    search: {
      id: search.string(),
      'player-id': search.string(),
    },
  },
});

/**
 * The page of the room `roomId`: where a player joins it, or, with `playerId`,
 * the game as that player.
 */
export const roomPage = (roomId: string, playerId?: string): Href =>
  routes.rooms.href({ search: { id: roomId, 'player-id': playerId } });
