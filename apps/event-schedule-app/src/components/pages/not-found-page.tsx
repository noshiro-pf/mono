import { Icon, NonIdealState } from 'blueprint-synstate';
import { constant, type JSX } from 'synstate-dom';
import { dict, routes } from '../../constants/index.mjs';
import { NavBar } from '../organisms/index.mjs';
import { Link } from '../router-components.mjs';
import * as styles from './not-found-page.module.css';

/**
 * An address no route matches, or an event that is not there: the navbar, as on
 * the sign-in page, and the message in the room below it.
 */
export const NotFoundPage = (): JSX.Element => (
  <div class={constant(styles.page)}>
    <NavBar />
    <div class={constant(styles.body)} data-e2e={constant('not-found-message')}>
      <NonIdealState
        action={
          <Link class={constant(styles.anchor)} to={routes.create.href()}>
            <Icon icon={'home'} />
            {constant(dict.topPage)}
          </Link>
        }
        icon={'search'}
        title={constant(dict.pageNotFound)}
      />
    </div>
  </div>
);
