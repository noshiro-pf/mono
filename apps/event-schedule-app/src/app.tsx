import { combine, map } from 'synstate';
import { constant, For, mapBindable, type JSX } from 'synstate-dom';
import { match } from 'ts-data-forge';
import * as styles from './app.module.css';
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

const { isRoute } = Router;

/** The page the address names; each is drawn anew as it is opened. */
const page$ = combine([
  isRoute.createPage$,
  isRoute.editPage$,
  isRoute.answerPage$,
  isRoute.eventListPage$,
  isRoute.registerPage$,
  isRoute.signInPage$,
]).pipe(
  map(
    ([
      createPage,
      editPage,
      answerPage,
      eventListPage,
      registerPage,
      signInPage,
    ]): Page =>
      createPage
        ? 'create'
        : editPage
          ? 'edit'
          : answerPage
            ? 'answer'
            : eventListPage
              ? 'eventList'
              : registerPage
                ? 'register'
                : signInPage
                  ? 'signIn'
                  : 'notFound',
  ),
);

export const App = (): JSX.Element => (
  <div class={constant(styles.app)}>
    <For items={mapBindable(page$, (page) => [page])} key={(page) => page}>
      {(page$_) => (
        <ErrorBoundary>
          {match(page$_.getSnapshot().value, {
            create: <CreateEventSchedule />,
            edit: <EditEventSchedule />,
            answer: <AnswerPage />,
            eventList: <EventListPage />,
            register: <RegisterPage />,
            signIn: <SignInPage />,
            notFound: <NotFoundPage />,
          })}
        </ErrorBoundary>
      )}
    </For>
    <Footer />
  </div>
);

type Page =
  | 'answer'
  | 'create'
  | 'edit'
  | 'eventList'
  | 'notFound'
  | 'register'
  | 'signIn';
