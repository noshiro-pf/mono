import {
  withSlash,
  type ReadonlyURLSearchParams,
} from 'tiny-router-observable';
import type { DeepReadonly } from 'ts-type-forge';
import { routes } from './route-paths.mjs';

export const params = {
  roomId: 'id',
  playerId: 'player-id',
  replay: 'replay',
  observe: 'observe',
} as const;

/**
 * The page of the room `roomId`: where a player joins it, or, with
 * `playerId`, the game as that player.
 */
export const roomPage = (roomId: string, playerId?: string): string => {
  const query = new URLSearchParams({
    [params.roomId]: roomId,
    ...(playerId === undefined ? {} : { [params.playerId]: playerId }),
  });

  return `${withSlash(routes.rooms)}?${query.toString()}`;
};

export const getRoomId = (
  path: string,
  queryParams: ReadonlyURLSearchParams,
): string | undefined =>
  path === withSlash(routes.rooms)
    ? (queryParams.get(params.roomId) ?? undefined)
    : undefined;

export const isMainPage = (path: string): boolean =>
  path === routes.main || path === withSlash(routes.createRoom);

export const getParams = (
  queryParams: ReadonlyURLSearchParams,
): DeepReadonly<{
  playerId: string | undefined;
  replay: boolean;
  observe: boolean;
}> =>
  ({
    playerId: queryParams.get(params.playerId) ?? undefined,
    replay: queryParams.get(params.replay) === 'true',
    observe: queryParams.get(params.observe) === 'true',
  }) as const;
