import { constant, type JSX } from 'synstate-dom';
import { dictionary, routes } from '../constants/index.mjs';
import { Router } from '../router.mjs';
import { Button } from './bp/index.mjs';
import * as styles from './not-found-page.module.css';

export const NotFoundPage = (): JSX.Element => (
  <div class={constant(styles.page)}>
    <h1>{constant(dictionary.notFoundPage.title)}</h1>
    <div>
      <Button onClick={goToMain}>
        {constant(dictionary.notFoundPage.backToMain)}
      </Button>
    </div>
  </div>
);

const goToMain = (): void => {
  Router.push(routes.main);
};
