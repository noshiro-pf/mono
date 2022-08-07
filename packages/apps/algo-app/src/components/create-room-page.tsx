import { dictionary } from '../constants';
import { CreateRoom } from '../store';
import { ButtonPrimary, Input, Spinner } from './bp';
import { MainPage } from './styled';

const dc = dictionary.createRoom;

export const CreateRoomPage = memoNamed('CreateRoomPage', () => {
  const roomPassword = useObservableValue(CreateRoom.roomPassword$);
  const hostUsername = useObservableValue(CreateRoom.hostUsername$);
  const loading = useObservableValue(CreateRoom.isWaitingResponse$);

  return (
    <MainPage.Centering>
      <MainPage.FormRect>
        <MainPage.BodyWrapper>
          <MainPage.BodyStyled>
            <MainPage.Block>
              <MainPage.Label>{dc.roomPassword.label}</MainPage.Label>
              <Input
                disabled={loading}
                placeholder={dc.roomPassword.placeholder}
                type='text'
                value={roomPassword}
                onInput={CreateRoom.onPasswordInput}
              />
            </MainPage.Block>
            <MainPage.Block>
              <MainPage.Label>{dc.hostUsername.label}</MainPage.Label>
              <Input
                disabled={loading}
                placeholder={dc.hostUsername.placeholder}
                type='text'
                value={hostUsername}
                onInput={CreateRoom.onUsernameInput}
              />
            </MainPage.Block>
            <MainPage.ButtonWrapper>
              <ButtonPrimary
                disabled={hostUsername === '' || loading}
                type='button'
                onClick={CreateRoom.onCreateRoomButtonClick}
              >
                <ButtonContent>
                  {loading ? <Spinner size={20} /> : <span>{dc.button}</span>}
                </ButtonContent>
              </ButtonPrimary>
            </MainPage.ButtonWrapper>
          </MainPage.BodyStyled>
        </MainPage.BodyWrapper>
      </MainPage.FormRect>
    </MainPage.Centering>
  );
});

const ButtonContent = styled('div')`
  width: 70px;
`;
