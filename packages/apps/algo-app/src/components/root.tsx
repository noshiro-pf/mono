import { useResizeObserver } from '@noshiro/resize-observer-preact-hooks';
import {
  dictionary,
  getParams,
  getRoomId,
  isMainPage,
  routes,
} from '../constants';
import { createRoom, db } from '../store';
import { Button } from './bp';
import { CreateRoomPage } from './create-room-page';
import { GameMain } from './game-main';
import { JoinRoomPage } from './join-room-page';

const goToMain = (): void => {
  push(routes.main);
};

export const Root = memoNamed('Root', () => {
  const [windowSize, ref] = useResizeObserver<HTMLDivElement>({
    width: 1280,
    height: 720,
    top: 0,
    left: 0,
  });

  const pathname = usePathname();
  const queryParams = useQueryParams();

  const showMain = useMemo(() => isMainPage(pathname), [pathname]);

  const roomId = useMemo(() => getRoomId(pathname), [pathname]);

  const { playerId, replay, observe } = useMemo(
    () => getParams(queryParams),
    [queryParams]
  );

  useEffect(() => {
    if (roomId !== undefined) {
      db.setRoomId(roomId);
    }
  }, [roomId]);

  useObservableEffect(createRoom.response$, (res) => {
    push(`${routes.rooms}/${res.id}`);
  });

  return (
    <div ref={ref} data-cy={'root'} style={rootStyle}>
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
} as const satisfies preact.JSX.CSSProperties;

const NotFoundPage = styled('div')`
  padding: 20px;
`;
