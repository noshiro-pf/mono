import { AnchorButton, NonIdealState } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { dict, routes } from '../../constants';

export const NotFoundPage = memoNamed('NotFoundPage', () => (
  <NonIdealState
    action={
      <AnchorButton href={routes.createPage} icon={'home'}>
        {dict.topPage}
      </AnchorButton>
    }
    icon={'search'}
    title={dict.pageNotFound}
  />
));
