import { Icon, NonIdealState } from '@blueprintjs/core';
import { useRouterLinkClick } from '@noshiro/tiny-router-react-hooks';
import { routes } from '../../constants';
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
        <Anchor href={routes.createPage} onClick={onClick}>
          <Icon icon={'home'} />
          {dict.topPage}
        </Anchor>
      }
      icon={'search'}
      title={dict.pageNotFound}
    />
  );
});
