import { AnchorButton, NonIdealState } from '@blueprintjs/core';
import { useRouterLinkClick } from '@noshiro/tiny-router-react-hooks';
import { dict, routes } from '../../constants';
import { router } from '../../store';

export const NotFoundPage = memoNamed('NotFoundPage', () => {
  const onClick = useRouterLinkClick({
    replace: false,
    pushFn: router.push,
    redirectFn: router.redirect,
  });

  return (
    <NonIdealState
      action={
        <AnchorButton href={routes.createPage} icon={'home'} onClick={onClick}>
          {dict.topPage}
        </AnchorButton>
      }
      icon={'search'}
      title={dict.pageNotFound}
    />
  );
});
