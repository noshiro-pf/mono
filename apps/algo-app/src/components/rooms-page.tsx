import { map, type InitializedObservable } from 'synstate';
import {
  createAfterUpdate,
  MatchOptional,
  subscribeInScope,
  type JSX,
} from 'synstate-dom';
import type { PageMatchOf, PageValues } from 'synstate-router';
import { Optional } from 'ts-data-forge';
import type { Rect } from 'ts-utils-additional';
import type { routes } from '../constants/index.mjs';
import { roomStore } from '../store/index.mjs';
import { GameMain } from './game-main.js';
import { JoinRoomPage } from './join-room-page.js';
import { NotFoundPage } from './not-found-page.js';

type Props = Readonly<{
  values$: InitializedObservable<
    PageValues<PageMatchOf<typeof routes, 'rooms'>>
  >;
  windowSize: InitializedObservable<Rect>;
}>;

/**
 * The page of a room: where a player joins it, or the game once they have.
 * Without a room, or with an empty one, it is not found.
 *
 * The room and the player are handed to the store while the page is open: the
 * subscriptions live in its scope.
 */
export const RoomsPage = ({ values$, windowSize }: Props): JSX.Element => {
  // `?id=` names no room: it is drawn as no room at all.
  const roomId = values$.pipe(
    map((values) => (values.search.id === '' ? undefined : values.search.id)),
  );

  const playerId = values$.pipe(map((values) => values.search['player-id']));

  // The store is written once the update that changed the value has finished,
  // not from inside it.
  const afterUpdate = createAfterUpdate();

  subscribeInScope(roomId, (id) => {
    if (id !== undefined) {
      afterUpdate(() => {
        roomStore.setRoomId(id);
      });
    }
  });

  subscribeInScope(playerId, (id) => {
    if (id !== undefined) {
      afterUpdate(() => {
        roomStore.setMyName(id);
      });
    }
  });

  return (
    <MatchOptional
      none={<NotFoundPage />}
      some={(roomId$) => (
        <MatchOptional
          none={<JoinRoomPage roomId={roomId$} />}
          some={() => <GameMain windowSize={windowSize} />}
          value={playerId.pipe(map(Optional.fromNullable))}
        />
      )}
      value={roomId.pipe(map(Optional.fromNullable))}
    />
  );
};
