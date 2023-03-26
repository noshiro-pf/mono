import { Icon, NonIdealState } from '@blueprintjs/core';
import { Routes } from '../../constants';
import { router } from '../../store';
import { Anchor } from '../bp';

export const NotFoundPage = memoNamed('NotFoundPage', () => {
  const onClick = useRouterLinkClick({
    replace: false,
    pushFn: router.push,
    redirectFn: router.redirect,
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
