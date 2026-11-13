import {
  createBooleanState,
  createState,
  type InitializedObservable,
} from 'synstate';
import { constant, deriveBindable, If, type JSX } from 'synstate-dom';
import { Result } from 'ts-data-forge';
import { dictionary, roomPage } from '../constants/index.mjs';
import { router } from '../router.mjs';
import { roomStore, type JoinRoomError } from '../store/index.mjs';
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

  const [joinError, setJoinError] = createState<JoinRoomError | undefined>(
    undefined,
  );

  // A missing room is said before any try, since nothing can join it.
  const errorMessage = deriveBindable(
    [joinError, roomStore.isRoomMissing],
    (error, isRoomMissing) =>
      isRoomMissing
        ? dc.errors.roomMissing
        : error === undefined
          ? ''
          : dc.errors[error],
  );

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

    // The URL carries the name, and a lone surrogate (half of a pasted emoji)
    // cannot be written into one: it is replaced before the player joins, so
    // that the room and the URL hold the same name.
    const name = getUsername().toWellFormed();

    setJoinError(undefined);

    // Navigated once the join has settled rather than from a subscriber, so the
    // router is not written to while the store's update propagates. A join that
    // failed stays here and says why.
    roomStore.joinRoom
      .dispatch(id, name)
      .then((joined) => {
        if (Result.isErr(joined)) {
          setJoinError(joined.value);

          return;
        }

        router.push(roomPage(id, joined.value));
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
            disabled={deriveBindable(
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
        <If
          cond={deriveBindable([errorMessage], (message) => message !== '')}
          then={
            <div class={constant(styles.error)} role={constant('alert')}>
              {errorMessage}
            </div>
          }
        />
      </div>
    </div>
  );
};
