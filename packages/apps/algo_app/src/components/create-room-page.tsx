import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import { useCallback, useState } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import { text } from '../constants';
import { ButtonPrimary, Input, Spinner } from './bp';

const vt = text.createRoom;

type Props = Readonly<{
  onCreateRoomClick: (username: string, password: string) => void;
  loading: boolean;
}>;

export const CreateRoomPage = memoNamed<Props>(
  'CreateRoomPage',
  ({ onCreateRoomClick, loading }) => {
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');

    const onPasswordInput: JSXInternal.GenericEventHandler<HTMLInputElement> =
      useCallback((ev) => {
        setPassword(ev.currentTarget.value);
      }, []);

    const onUsernameInput: JSXInternal.GenericEventHandler<HTMLInputElement> =
      useCallback((ev) => {
        setUsername(ev.currentTarget.value);
      }, []);

    const disabled: boolean = username === '';

    const onCreateRoomButtonClick = useCallback(() => {
      onCreateRoomClick(username, password);
    }, [username, password, onCreateRoomClick]);

    return (
      <Centering>
        <FormRect>
          <Block>
            <Label>{vt.gamePassword.label}</Label>
            <Input
              disabled={loading}
              placeholder={vt.gamePassword.placeholder}
              type='text'
              value={password}
              onInput={onPasswordInput}
            />
          </Block>
          <Block>
            <Label>{vt.username.label}</Label>
            <Input
              disabled={loading}
              placeholder={vt.username.placeholder}
              type='text'
              value={username}
              onInput={onUsernameInput}
            />
          </Block>
          <ButtonWrapper>
            <ButtonPrimary
              disabled={disabled || loading}
              type='button'
              onClick={onCreateRoomButtonClick}
            >
              {vt.button}
            </ButtonPrimary>
          </ButtonWrapper>
          <SpinnerWrapper>{loading ? <Spinner /> : undefined}</SpinnerWrapper>
        </FormRect>
      </Centering>
    );
  }
);

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

const SpinnerWrapper = styled('div')`
  margin: 10px;
`;
