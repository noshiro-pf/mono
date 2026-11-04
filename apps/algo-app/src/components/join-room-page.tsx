import {
  createBooleanState,
  createState,
  type InitializedObservable,
} from 'synstate';
import { constant, derive, If, type JSX } from 'synstate-dom';
import { Result } from 'ts-data-forge';
import { dictionary, roomPage } from '../constants/index.mjs';
import { router } from '../router.mjs';
import { roomStore } from '../store/index.mjs';
import { Button, Input, Spinner } from './bp/index.mjs';
import * as styles from './room-form.module.css';

const dc = dictionary.joinRoom;

type Props = Readonly<{ roomId: InitializedObservable<string> }>;

export const JoinRoomPage = ({ roomId }: Props): JSX.Element => {
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

    // Navigated once the join has settled rather than from a subscriber, so the
    // router is not written to while the store's update propagates. The URL
    // carries the id the player was added as.
    roomStore.joinRoom
      .dispatch(id, getUsername())
      .then((added) => {
        if (Result.isOk(added)) {
          router.push(roomPage(id, added.value));
        } else {
          console.error(added.value);
        }
      })
      .catch(console.error);
  };

  return (
    <div class={constant(styles.centering)}>
      <div class={constant(styles.form)}>
        <div class={constant(styles.body)}>
          <div class={constant(styles.block)}>
            <div class={constant(styles.label)}>
              {constant(dc.roomPassword.label)}
            </div>
            <Input
              disabled={loading}
              label={dc.roomPassword.label}
              value={password}
              onValueChange={setPassword}
            />
            <If
              cond={showPasswordError}
              then={
                <div class={constant(styles.error)}>
                  {constant(dc.roomPassword.notMatch)}
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
    </div>
  );
};
