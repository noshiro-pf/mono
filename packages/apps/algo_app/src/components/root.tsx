import { styled } from '@noshiro/goober';
import { useResizeObserver } from '@noshiro/preact-resize-observer-hooks';
import { memoNamed } from '@noshiro/preact-utils';
import { useStreamEffect } from '@noshiro/syncflow-preact-hooks';
import { useRouter } from '@noshiro/tiny-router-preact-hooks';
import { useCallback, useMemo } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import { getParams, getRoomId, isMainPage, routes, text } from '../constants';
import { response$ } from '../observables';
import { Button } from './bp';
import { CreateRoomPage } from './create-room-page';
import { GameMain } from './game-main';
import { JoinRoomPage } from './join-room-page';

export const Root = memoNamed('Root', () => {
  const [windowSize, ref] = useResizeObserver<HTMLDivElement>({
    width: 1280,
    height: 720,
    top: 0,
    left: 0,
  });

  const { pathname, queryParams, push } = useRouter();

  const showMain = useMemo(() => isMainPage(pathname), [pathname]);

  const roomId = useMemo(() => getRoomId(pathname), [pathname]);

  const { playerId, replay, observe } = useMemo(
    () => getParams(queryParams),
    [queryParams]
  );

  const goToMain = useCallback(() => {
    push(routes.main);
  }, [push]);

  useStreamEffect(response$, (res) => {
    push(`${routes.rooms}/${res.id}`);
  });

  return (
    <div ref={ref} style={rootStyle}>
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
            roomId={roomId}
            windowSize={windowSize}
          />
        )
      ) : (
        <NotFoundPage>
          <h1>{text.notFoundPage.title}</h1>
          <div>
            <Button onClick={goToMain}>{text.notFoundPage.backToMain}</Button>
          </div>
        </NotFoundPage>
      )}
    </div>
  );
});

const rootStyle: JSXInternal.CSSProperties = {
  width: '100vw',
  height: '100vh',
} as const;

const NotFoundPage = styled('div')`
  padding: 20px;
`;
