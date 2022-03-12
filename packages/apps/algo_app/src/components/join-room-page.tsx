import { styled } from '@noshiro/goober';
import { memoNamed, useState } from '@noshiro/preact-utils';
import { useObservableValue } from '@noshiro/syncflow-preact-hooks';
import { useCallback } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import { text } from '../constants';
import { db, joinRoom } from '../observables';
import { ButtonPrimary, Input, Spinner } from './bp';

const vt = text.joinRoom;

type Props = Readonly<{ roomId: string }>;

export const JoinRoomPage = memoNamed<Props>('JoinRoomPage', ({ roomId }) => {
  /*
    TODO:
    local state に自分の名前を追加
    roomに自分の名前があればゲーム開始前画面を表示
   */

  const { state: password, setState: setPassword } = useState<string>('');
  const { state: username, setState: setUsername } = useState<string>('');

  const onPasswordInput: JSXInternal.GenericEventHandler<HTMLInputElement> =
    useCallback(
      (ev) => {
        setPassword(ev.currentTarget.value);
      },
      [setPassword]
    );

  const onUsernameInput: JSXInternal.GenericEventHandler<HTMLInputElement> =
    useCallback(
      (ev) => {
        setUsername(ev.currentTarget.value);
      },
      [setUsername]
    );

  const disabled: boolean = username === '';

  const { state: showPasswordError, setState: setShowPasswordError } =
    useState<boolean>(false);

  const room = useObservableValue(db.room$);

  const onJoinRoomButtonClick = useCallback(() => {
    if (room === undefined) return;
    if (room.password !== '') {
      if (room.password !== password) {
        setShowPasswordError(true);
        return;
      }
    }
    joinRoom.dispatch(roomId, username).catch(console.error);
  }, [room, roomId, username, password, setShowPasswordError]);

  const loading = useObservableValue(joinRoom.isWaitingResponse$);

  return (
    <Centering>
      <FormRect>
        <Block>
          <Label>{vt.gamePassword.label}</Label>
          <Input
            disabled={loading}
            type='text'
            value={password}
            onInput={onPasswordInput}
          />
          {showPasswordError ? (
            <ErrorMessage>{text.joinRoom.gamePassword.notMatch}</ErrorMessage>
          ) : undefined}
        </Block>
        <Block>
          <Label>{vt.username.label}</Label>
          <Input
            disabled={loading}
            type='text'
            value={username}
            onInput={onUsernameInput}
          />
        </Block>
        <ButtonWrapper>
          <ButtonPrimary
            disabled={disabled || loading}
            type='button'
            onClick={onJoinRoomButtonClick}
          >
            {loading ? <Spinner size={20} /> : <span>{vt.button}</span>}
          </ButtonPrimary>
        </ButtonWrapper>
      </FormRect>
    </Centering>
  );
});

const Centering = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at 50% 50%,
    rgb(255 255 255) 0%,
    rgb(202 202 202) 100%
  );
`;

const FormRect = styled('div')`
  width: 400px;
  height: 500px;
  border-radius: 10px;
  background-color: white;
  filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.25));

  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Block = styled('div')`
  margin: 10px;
  padding: 10px;
`;

const Label = styled('div')`
  font-weight: bold;
  margin-bottom: 5px;
`;

const ButtonWrapper = styled('div')`
  margin: 10px;
`;

const ErrorMessage = styled('div')`
  font-size: small;
  color: red;
`;
