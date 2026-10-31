import {
  createBooleanState,
  createState,
  type InitializedObservable,
} from 'synstate';
import { constant, derive, If, type JSX } from 'synstate-dom';
import { dictionary, roomPage } from '../constants/index.mjs';
import { Router } from '../router.mjs';
import { roomStore } from '../store/index.mjs';
import { Button, Input, Spinner } from './bp/index.mjs';
import * as styles from './room-form.module.css';

const dc = dictionary.joinRoom;

type Props = Readonly<{ roomId: InitializedObservable<string> }>;

export const JoinRoomPage = ({ roomId }: Props): JSX.Element => {
  /*
    TODO:
    roomに自分の名前があればゲーム開始前画面を表示
   */

  const [password, setPassword, { getSnapshot: getPassword }] =
    createState<string>('');

  const [username, setUsername, { getSnapshot: getUsername }] =
    createState<string>('');

  const [showPasswordError, { setTrue: setShowPasswordError }] =
    createBooleanState(false);

  const room = roomStore.room;

  const loading = roomStore.joinRoom.isWaitingResponse;

  const onJoinRoomButtonClick = (): void => {
    const currentRoom = room.getSnapshot().value;

    if (currentRoom === undefined) {
      return;
    }

    if (currentRoom.password !== '' && currentRoom.password !== getPassword()) {
      setShowPasswordError();

      return;
    }

    const id = roomId.getSnapshot().value;

    const name = getUsername();

    // Navigated once the join has settled rather than from a subscriber, so the
    // router is not written to while the store's update propagates.
    roomStore.joinRoom
      .dispatch(id, name)
      .then(() => {
        Router.push(roomPage(id, name));
      })
      .catch(console.error);
  };

  return (
    <div class={constant(styles.centering)}>
      <div class={constant(styles.form)}>
        <div class={constant(styles.block)}>
          <div class={constant(styles.label)}>
            {constant(dc.gamePassword.label)}
          </div>
          <Input
            disabled={loading}
            label={dc.gamePassword.label}
            value={password}
            onValueChange={setPassword}
          />
          <If
            cond={showPasswordError}
            then={
              <div class={constant(styles.error)}>
                {constant(dc.gamePassword.notMatch)}
              </div>
            }
          />
        </div>
        <div class={constant(styles.block)}>
          <div class={constant(styles.label)}>
            {constant(dc.username.label)}
          </div>
          <Input
            disabled={loading}
            label={dc.username.label}
            value={username}
            onValueChange={setUsername}
          />
        </div>
        <div class={constant(styles.buttonWrapper)}>
          <Button
            intent={'primary'}
            // Joining checks the password against the room, so it waits for the
            // room.
            disabled={derive(
              [username, room, loading],
              (name, r, isLoading) =>
                name === '' || r === undefined || isLoading,
            )}
            onClick={onJoinRoomButtonClick}
          >
            <If
              cond={loading}
              else={<span>{constant(dc.button)}</span>}
              then={<Spinner size={20} />}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};
