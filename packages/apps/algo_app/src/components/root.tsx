import { styled } from '@noshiro/goober';
import { useResizeObserver } from '@noshiro/preact-resize-observer-hooks';
import {
  useStreamEffect,
  useStreamValue,
} from '@noshiro/preact-syncflow-hooks';
import { memoNamed } from '@noshiro/preact-utils';
import { useCallback, useMemo } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import { getRoomId, isMainPage, routes, text } from '../constants';
import {
  isWaitingResponse$,
  onCreateRoomClick,
  response$,
} from '../observables';
import { useRouter } from '../router';
import { Button } from './bp';
import { CreateRoomPage } from './create-room-page';
import { GameMain } from './game-main';

export const Root = memoNamed('Root', () => {
  const [windowSize, ref] = useResizeObserver<HTMLDivElement>({
    width: 1280,
    height: 720,
    top: 0,
    left: 0,
  });

  const { pathname, push } = useRouter();

  const showMain = useMemo(() => isMainPage(pathname), [pathname]);

  const roomId = useMemo(() => getRoomId(pathname), [pathname]);

  const goToMain = useCallback(() => {
    push(routes.main);
  }, [push]);

  const showNotFoundPage = !showMain && roomId === undefined;

  const loading = useStreamValue(isWaitingResponse$);

  useStreamEffect(response$, (res) => {
    push(`${routes.rooms}/${res.id}`);
  });

  return (
    <div ref={ref} style={rootStyle}>
      {/* simple routing */}
      {showMain ? (
        <CreateRoomPage
          loading={loading}
          onCreateRoomClick={onCreateRoomClick}
        />
      ) : undefined}
      {roomId === undefined ? undefined : (
        <GameMain roomId={roomId} windowSize={windowSize} />
      )}
      {showNotFoundPage ? (
        <NotFoundPage>
          <h1>{text.notFoundPage.title}</h1>
          <div>
            <Button onClick={goToMain}>{text.notFoundPage.backToMain}</Button>
          </div>
        </NotFoundPage>
      ) : undefined}
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
