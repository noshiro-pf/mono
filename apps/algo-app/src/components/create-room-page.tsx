import { createState } from 'synstate';
import { constant, derive, If, type JSX } from 'synstate-dom';
import { Result } from 'ts-data-forge';
import { dictionary } from '../constants/index.mjs';
import { roomStore } from '../store/index.mjs';
import { Button, Input, Spinner } from './bp/index.mjs';
import * as styles from './room-form.module.css';

const dc = dictionary.createRoom;

export const CreateRoomPage = (): JSX.Element => {
  const [password, setPassword, { getSnapshot: getPassword }] =
    createState<string>('');

  const [username, setUsername, { getSnapshot: getUsername }] =
    createState<string>('');

  const loading = roomStore.createRoom.isWaitingResponse;

  const onCreateRoomButtonClick = (): void => {
    roomStore.createRoom
      .dispatch({ username: getUsername(), password: getPassword() })
      .then((result) => {
        if (Result.isErr(result)) {
          console.error(result.value);
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
              placeholder={dc.roomPassword.placeholder}
              value={password}
              onValueChange={setPassword}
            />
          </div>
          <div class={constant(styles.block)}>
            <div class={constant(styles.label)}>
              {constant(dc.hostUsername.label)}
            </div>
            <Input
              disabled={loading}
              label={dc.hostUsername.label}
              placeholder={dc.hostUsername.placeholder}
              value={username}
              onValueChange={setUsername}
            />
          </div>
          <div class={constant(styles.buttonWrapper)}>
            <Button
              intent={'primary'}
              disabled={derive(
                [username, loading],
                (name, isLoading) => name === '' || isLoading,
              )}
              onClick={onCreateRoomButtonClick}
            >
              <div class={constant(styles.createButtonContent)}>
                <If
                  cond={loading}
                  else={<span>{constant(dc.button)}</span>}
                  then={<Spinner size={20} />}
                />
              </div>
            </Button>
          </div>
          <If
            cond={roomStore.createRoom.hasFailed}
            then={
              <div class={constant(styles.error)} role={constant('alert')}>
                {constant(dc.failed)}
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
