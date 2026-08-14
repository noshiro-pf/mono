import { Icon, NonIdealState } from '@blueprintjs/core';
import { Anchor } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { createRouterLinkClickHandler } from 'tiny-router-react-hooks';
import { Routes } from '../../constants/index.mjs';
import { Router } from '../../store/index.mjs';

export const NotFoundPage = memoNamed('NotFoundPage', () => (
  <NonIdealState action={action} icon={'search'} title={dict.pageNotFound} />
));

const onClick = createRouterLinkClickHandler({
  replace: false,
  pushFn: Router.push,
  redirectFn: Router.redirect,
});

const action = (
  <Anchor href={Routes.routes.createPage} onClick={onClick}>
    <Icon icon={'home'} />
    {dict.topPage}
  </Anchor>
);
