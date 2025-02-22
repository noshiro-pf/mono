import { Icon, NonIdealState } from '@blueprintjs/core';
import { Anchor } from '@noshiro/react-blueprintjs-utils';
import { Routes } from '../../constants';
import { Router } from '../../store';

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
