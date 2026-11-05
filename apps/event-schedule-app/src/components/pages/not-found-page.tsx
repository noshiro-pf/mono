import { Icon, NonIdealState } from 'blueprint-synstate';
import { constant, type JSX } from 'synstate-dom';
import { Routes, dict } from '../../constants/index.mjs';
import { routerLinkClick } from '../../functions/index.mjs';
import { Router } from '../../store/index.mjs';
import * as styles from './not-found-page.module.css';

export const NotFoundPage = (): JSX.Element => (
  <NonIdealState
    action={
      <a
        class={constant(styles.anchor)}
        href={constant(Routes.routes.createPage)}
        onClick={routerLinkClick(Router.push)}
      >
        <Icon icon={'home'} />
        {constant(dict.topPage)}
      </a>
    }
    icon={'search'}
    title={constant(dict.pageNotFound)}
  />
);
