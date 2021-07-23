import { AnchorButton, NonIdealState } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { texts } from '../../constants';
import { routePaths } from '../../routing';

export const NotFoundPage = memoNamed('NotFoundPage', () => (
  <NonIdealState
    action={
      <AnchorButton href={routePaths.createPage} icon={'home'}>
        {texts.topPage}
      </AnchorButton>
    }
    icon={'search'}
    title={texts.pageNotFound}
  />
));
