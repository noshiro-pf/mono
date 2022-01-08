import { AnchorButton, NonIdealState } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { dict, routes } from '../../constants';
import { router } from '../../store';
import { useRouterLinkClick } from '../../utils';

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
