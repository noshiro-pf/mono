import {
  AnswerPage,
  CreateEventSchedule,
  EditEventSchedule,
  Footer,
  NotFoundPage,
  RegisterPage,
  SignInPage,
} from './components';
import { useShowPage } from './store';

export const Main = memoNamed('Main', () => {
  const show = useShowPage();

  return (
    <Root>
      {show.createPage ? (
        <CreateEventSchedule />
      ) : show.editPage ? (
        <EditEventSchedule />
      ) : show.answerPage ? (
        <AnswerPage />
      ) : show.registerPage ? (
        <RegisterPage />
      ) : show.signInPage ? (
        <SignInPage />
      ) : (
        <NotFoundPage />
      )}
      <Footer />
    </Root>
  );
});

const Root = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
