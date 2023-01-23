import { text } from '../constants';
import { createRoom } from '../observables';
import { ButtonPrimary, Input, Spinner } from './bp';

const vt = text.createRoom;

export const CreateRoomPage = memoNamed('CreateRoomPage', () => {
  const { state: password, setState: setPassword } = useState<string>('');
  const { state: username, setState: setUsername } = useState<string>('');

  const onPasswordInput: GenericEventHandler<HTMLInputElement> = useCallback(
    (ev) => {
      setPassword(ev.currentTarget.value);
    },
    [setPassword]
  );

  const onUsernameInput: GenericEventHandler<HTMLInputElement> = useCallback(
    (ev) => {
      setUsername(ev.currentTarget.value);
    },
    [setUsername]
  );

  const disabled: boolean = username === '';

  const onCreateRoomButtonClick = useCallback(() => {
    createRoom.dispatch({ username, password }).catch(console.error);
  }, [username, password]);

  const loading = useObservableValue(createRoom.isWaitingResponse$);

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
            <ButtonContent>
              {loading ? <Spinner size={20} /> : <span>{vt.button}</span>}
            </ButtonContent>
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

const ButtonContent = styled('div')`
  width: 70px;
`;
