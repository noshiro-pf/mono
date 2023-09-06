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
import { Router } from './store';

export const App = memoNamed('App', () => {
  const show = Router.useShowPage();

  return (
    <ErrorBoundary>
      <div
        css={css`
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        `}
      >
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
      </div>
    </ErrorBoundary>
  );
});
