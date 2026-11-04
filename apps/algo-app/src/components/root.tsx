import { createState, onScopeDispose } from 'synstate';
import {
  constant,
  createAfterUpdate,
  subscribeInScope,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { Rect } from 'ts-utils-additional';
import { roomPage } from '../constants/index.mjs';
import { router, Routes } from '../router.mjs';
import { roomStore } from '../store/index.mjs';
import { CreateRoomPage } from './create-room-page.js';
import { NotFoundPage } from './not-found-page.js';
import { RoomsPage } from './rooms-page.js';
import * as styles from './root.module.css';

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

  // The router is written once the update that changed the value has finished,
  // not from inside it.
  const afterUpdate = createAfterUpdate();

  // The creator is already a player of the room, by the name they gave, so they
  // open it as that player rather than on its join form.
  subscribeInScope(roomStore.createRoom.response, ({ room, myName }) => {
    afterUpdate(() => {
      router.push(roomPage(room.id, myName));
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
      {/* `/` and `/create/` are the same page, drawn again when the history
          moves between them: nothing in the app links one to the other. */}
      <Routes
        cases={{
          main: () => <CreateRoomPage />,
          createRoom: () => <CreateRoomPage />,
          rooms: (values$) => (
            <RoomsPage values$={values$} windowSize={windowSize} />
          ),
        }}
        notFound={<NotFoundPage />}
      />
    </div>
  );
};
