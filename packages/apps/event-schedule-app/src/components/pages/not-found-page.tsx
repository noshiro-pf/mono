import { Icon, NonIdealState } from '@blueprintjs/core';
import { Anchor } from '@noshiro/react-blueprintjs-utils';
import { Routes } from '../../constants';
import { Router } from '../../store';

export const NotFoundPage = memoNamed('NotFoundPage', () => {
  const onClick = useRouterLinkClick({
    replace: false,
    pushFn: Router.push,
    redirectFn: Router.redirect,
  });

  return (
    <NonIdealState
      action={
        <Anchor href={Routes.routes.createPage} onClick={onClick}>
          <Icon icon={'home'} />
          {dict.topPage}
        </Anchor>
      }
      icon={'search'}
      title={dict.pageNotFound}
    />
  );
});
