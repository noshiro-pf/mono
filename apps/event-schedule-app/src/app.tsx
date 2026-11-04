import { css } from '@emotion/react';
import { memoNamed } from 'react-utils';
import { expectType } from 'ts-data-forge';
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
} from './components/index.mjs';
import { ErrorBoundary } from './error-handler/index.mjs';
import { Router } from './store/index.mjs';

export const App = memoNamed('App', () => {
  const show = Router.useShowPage();

  // A page added to the router and not shown here fails this.
  expectType<
    keyof typeof show,
    | 'answerPage'
    | 'batchUpdatePage'
    | 'createPage'
    | 'editPage'
    | 'eventListPage'
    | 'registerPage'
    | 'signInPage'
  >('=');

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
        ) : show.batchUpdatePage ? (
          <BatchUpdatePage />
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
