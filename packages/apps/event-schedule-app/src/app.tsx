import {
  AnswerPage,
  BatchUpdatePage,
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
  const {
    createPage,
    editPage,
    answerPage,
    eventListPage,
    registerPage,
    signInPage,
    batchUpdatePage,
    ...rest
  } = Router.useShowPage();

  expectType<keyof typeof rest, never>('=');

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
        {createPage ? (
          <CreateEventSchedule />
        ) : editPage ? (
          <EditEventSchedule />
        ) : answerPage ? (
          <AnswerPage />
        ) : eventListPage ? (
          <EventListPage />
        ) : batchUpdatePage ? (
          <BatchUpdatePage />
        ) : registerPage ? (
          <RegisterPage />
        ) : signInPage ? (
          <SignInPage />
        ) : (
          <NotFoundPage />
        )}
        <Footer />
      </div>
    </ErrorBoundary>
  );
});
