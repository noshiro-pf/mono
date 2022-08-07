import { dictionary } from '../constants';
import { JoinRoom } from '../store';
import { ButtonPrimary, Input, Spinner } from './bp';
import { MainPage } from './styled';

const dc = dictionary.joinRoom;

/** TODO hooks から store に移動 */
export const JoinRoomPage = memoNamed('JoinRoomPage', () => {
  /*
    TODO:
    local state に自分の名前を追加
    roomに自分の名前があればゲーム開始前画面を表示
   */

  const roomPassword = useObservableValue(JoinRoom.roomPassword$);
  const username = useObservableValue(JoinRoom.username$);
  const showPasswordError = useObservableValue(JoinRoom.showPasswordError$);

  const disabled: boolean = username === '';

  const loading = useObservableValue(JoinRoom.isWaitingResponse$);

  return (
    <MainPage.Centering>
      <MainPage.FormRect>
        <MainPage.BodyWrapper>
          <MainPage.BodyStyled>
            <MainPage.Block>
              <MainPage.Label>{dc.roomPassword.label}</MainPage.Label>
              <Input
                disabled={loading}
                type='text'
                value={roomPassword}
                onInput={JoinRoom.onPasswordInput}
              />
              {showPasswordError ? (
                <ErrorMessage>
                  {dictionary.joinRoom.roomPassword.notMatch}
                </ErrorMessage>
              ) : undefined}
            </MainPage.Block>
            <MainPage.Block>
              <MainPage.Label>{dc.username.label}</MainPage.Label>
              <Input
                disabled={loading}
                type='text'
                value={username}
                onInput={JoinRoom.onUsernameInput}
              />
            </MainPage.Block>
            <MainPage.ButtonWrapper>
              <ButtonPrimary
                disabled={disabled || loading}
                type='button'
                onClick={JoinRoom.onJoinRoomButtonClick}
              >
                {loading ? <Spinner size={20} /> : <span>{dc.button}</span>}
              </ButtonPrimary>
            </MainPage.ButtonWrapper>
          </MainPage.BodyStyled>
        </MainPage.BodyWrapper>
      </MainPage.FormRect>
    </MainPage.Centering>
  );
});

const ErrorMessage = styled('div')`
  font-size: small;
  color: red;
`;
