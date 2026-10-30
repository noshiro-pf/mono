import { createState } from 'synstate';
import { constant, derive, If, type JSX } from 'synstate-dom';
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
            placeholder={dc.gamePassword.placeholder}
            value={password}
            onValueChange={setPassword}
          />
        </div>
        <div class={constant(styles.block)}>
          <div class={constant(styles.label)}>
            {constant(dc.username.label)}
          </div>
          <Input
            disabled={loading}
            label={dc.username.label}
            placeholder={dc.username.placeholder}
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
      </div>
    </div>
  );
};
