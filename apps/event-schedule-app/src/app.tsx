import { css } from '@emotion/react';
import { memoNamed } from 'react-utils';
import {
  AnswerPage,
  CreateEventSchedule,
  EditEventSchedule,
  EventListPage,
  Footer,
  NotFoundPage,
  RegisterPage,
  SignInPage,
} from './components/index.mjs';
import { ErrorBoundary } from './error-handler/index.mjs';
import { Router } from './store/index.mjs';

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
