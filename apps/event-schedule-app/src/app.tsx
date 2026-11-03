import { constant, type JSX } from 'synstate-dom';
import * as styles from './app.module.css';
import {
  AnswerPage,
  CreateEventSchedule,
  EditEventSchedule,
  EventListPage,
  Footer,
  NotFoundPage,
  RegisterPage,
  Routes,
  SignInPage,
} from './components/index.mjs';
import { ErrorBoundary } from './error-handler/index.mjs';

/** The page the address names; each is drawn anew as it is opened. */
export const App = (): JSX.Element => (
  <div class={constant(styles.app)}>
    <Routes
      cases={{
        // The router sends `/` to the create page.
        root: undefined,
        create: page(CreateEventSchedule),
        'event.answer': page(AnswerPage),
        'event.answer.edit': page(EditEventSchedule),
        eventList: page(EventListPage),
        register: page(RegisterPage),
        signIn: page(SignInPage),
      }}
      notFound={
        <ErrorBoundary>
          <NotFoundPage />
        </ErrorBoundary>
      }
    />
    <Footer />
  </div>
);

/** A page's case: the page, behind its own error boundary. */
const page = (Page: () => JSX.Element) => (): JSX.Element => (
  <ErrorBoundary>
    <Page />
  </ErrorBoundary>
);
