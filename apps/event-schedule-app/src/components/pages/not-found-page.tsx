import { Icon, NonIdealState } from 'blueprint-synstate';
import { constant, type JSX } from 'synstate-dom';
import { dict, routes } from '../../constants/index.mjs';
import { Link } from '../router-components.mjs';
import * as styles from './not-found-page.module.css';

export const NotFoundPage = (): JSX.Element => (
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
);
