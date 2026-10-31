import { createState, map, onScopeDispose } from 'synstate';
import { constant, If, MatchOptional, view, type JSX } from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import type { Rect } from 'ts-utils-additional';
import {
  getParams,
  getRoomId,
  isMainPage,
  roomPage,
} from '../constants/index.mjs';
import { Router } from '../router.mjs';
import { roomStore } from '../store/index.mjs';
import { CreateRoomPage } from './create-room-page.js';
import { GameMain } from './game-main.js';
import { JoinRoomPage } from './join-room-page.js';
import { NotFoundPage } from './not-found-page.js';
import * as styles from './root.module.css';
import { createAfterUpdate, subscribeInScope } from './scope-effects.mjs';

export const Root = (): JSX.Element => {
  const [windowSize, setWindowSize] = createState<Rect>({
    width: 1280,
    height: 720,
    top: 0,
    left: 0,
  });

  const resizeObserver = new ResizeObserver((entries) => {
    if (!Arr.isNonEmpty(entries)) {
      return;
    }

    const { width, height, top, left } = entries[0].contentRect;

    setWindowSize({ width, height, top, left });
  });

  onScopeDispose(() => {
    resizeObserver.disconnect();
  });

  const roomId = Router.state.pipe(
    map(({ pathname, searchParams }) => getRoomId(pathname, searchParams)),
  );

  const playerId = Router.state.pipe(
    map(({ searchParams }) => getParams(searchParams).playerId),
  );

  // The store and the router are written once the update that changed the
  // value has finished, not from inside it.
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

  subscribeInScope(roomStore.createRoom.response, (res) => {
    afterUpdate(() => {
      Router.push(roomPage(res.id));
    });
  });

  return (
    <div
      ref={(el) => {
        resizeObserver.observe(el);
      }}
      class={constant(styles.root)}
      data-e2e={constant('root')}
    >
      {/* simple routing */}
      <If
        cond={view(Router.state, ({ pathname }) => isMainPage(pathname))}
        else={
          <MatchOptional
            none={<NotFoundPage />}
            some={(roomId$) => (
              <MatchOptional
                none={<JoinRoomPage roomId={roomId$} />}
                some={() => <GameMain windowSize={windowSize} />}
                value={view(playerId, Optional.fromNullable)}
              />
            )}
            value={view(roomId, Optional.fromNullable)}
          />
        }
        then={<CreateRoomPage />}
      />
    </div>
  );
};
