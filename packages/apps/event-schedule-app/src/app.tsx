import {
  AnswerPage,
  CreateEventSchedule,
  EditEventSchedule,
  EventListPage,
  Footer,
  NotFoundPage,
  RegisterPage,
  SignInPage,
} from './components';
import { ErrorBoundary } from './error-handler';
import { useShowPage } from './store';

export const App = memoNamed('App', () => {
  const show = useShowPage();

  return (
    <ErrorBoundary>
      <Root>
        {show.createPage ? (
          <CreateEventSchedule />
        ) : show.editPage ? (
          <EditEventSchedule />
        ) : show.answerPage ? (
          <AnswerPage />
        ) : show.eventListPage ? (
          <EventListPage />
        ) : show.registerPage ? (
          <RegisterPage />
        ) : show.signInPage ? (
          <SignInPage />
        ) : (
          <NotFoundPage />
        )}
        <Footer />
      </Root>
    </ErrorBoundary>
  );
});

const Root = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
