import { useResizeObserverRef } from '@noshiro/resize-observer-preact-hooks';
import { dictionary, minWindowSize, Routes } from '../constants';
import { ElementSize, router, useShowPage } from '../store';
import { Button } from './bp';
import { CreateRoomPage } from './create-room-page';
import { GameMain } from './game-main';
import { JoinRoomPage } from './join-room-page';

const goToMain = (): void => {
  router.push(Routes.routes.main);
};

export const Root = memoNamed('Root', () => {
  const ref = useResizeObserverRef<HTMLDivElement>(ElementSize.setWindowSize);

  const showPage = useShowPage();

  const roomId = useObservableValue(router.roomId$);
  const playerId = useObservableValue(router.playerId$);

  return (
    <div ref={ref} data-e2e={'root'} style={rootStyle}>
      {/* simple routing */}
      {showPage.mainPage ? (
        <CreateRoomPage />
      ) : roomId === undefined ? (
        <NotFoundPage>
          <h1>{dictionary.notFoundPage.title}</h1>
          <div>
            <Button onClick={goToMain}>
              {dictionary.notFoundPage.backToMain}
            </Button>
          </div>
        </NotFoundPage>
      ) : playerId === undefined ? (
        <JoinRoomPage />
      ) : (
        <GameMain />
      )}
    </div>
  );
});

const rootStyle = {
  width: '100vw',
  height: '100vh',
  minWidth: `${minWindowSize.width}px`,
  minHeight: `${minWindowSize.height}px`,
  backgroundColor: '#f0f0f0',
} as const satisfies preact.JSX.CSSProperties;

const NotFoundPage = styled('div')`
  padding: 20px;
`;
