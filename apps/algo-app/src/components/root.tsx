import { styled } from 'goober';
import { memoNamed } from 'preact-utils';
import { useEffect, useMemo } from 'preact/hooks';
import { useResizeObserver } from 'resize-observer-preact-hooks';
import { useObservableEffect, useObservableValue } from 'synstate-preact-hooks';
import {
  dictionary,
  getParams,
  getRoomId,
  isMainPage,
  routes,
} from '../constants/index.mjs';
import { Router } from '../router.mjs';
import { createRoom, db } from '../store/index.mjs';
import { Button } from './bp/index.mjs';
import { CreateRoomPage } from './create-room-page.js';
import { GameMain } from './game-main.js';
import { JoinRoomPage } from './join-room-page.js';

const goToMain = (): void => {
  Router.push(routes.main);
};

export const Root = memoNamed('Root', () => {
  const [windowSize, ref] = useResizeObserver<HTMLDivElement>({
    width: 1280,
    height: 720,
    top: 0,
    left: 0,
  });

  const { pathname, searchParams: queryParams } = useObservableValue(
    Router.state,
  );

  const showMain = useMemo(() => isMainPage(pathname), [pathname]);

  const roomId = useMemo(() => getRoomId(pathname), [pathname]);

  const { playerId, replay, observe } = useMemo(
    () => getParams(queryParams),
    [queryParams],
  );

  useEffect(() => {
    if (roomId !== undefined) {
      db.setRoomId(roomId);
    }
  }, [roomId]);

  useObservableEffect(createRoom.response$, (res) => {
    Router.push(`${routes.rooms}/${res.id}`);
  });

  return (
    <div ref={ref} data-e2e={'root'} style={rootStyle}>
      {/* simple routing */}
      {showMain ? (
        <CreateRoomPage />
      ) : roomId !== undefined ? (
        playerId === undefined ? (
          <JoinRoomPage roomId={roomId} />
        ) : (
          <GameMain
            observe={observe}
            playerId={playerId}
            replay={replay}
            windowSize={windowSize}
          />
        )
      ) : (
        <NotFoundPage>
          <h1>{dictionary.notFoundPage.title}</h1>
          <div>
            <Button onClick={goToMain}>
              {dictionary.notFoundPage.backToMain}
            </Button>
          </div>
        </NotFoundPage>
      )}
    </div>
  );
});

const rootStyle = {
  width: '100vw',
  height: '100vh',
} as const satisfies preact.CSSProperties;

const NotFoundPage = styled('div')`
  padding: 20px;
`;
