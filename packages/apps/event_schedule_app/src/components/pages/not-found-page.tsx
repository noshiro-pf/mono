import { AnchorButton, NonIdealState } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { routes, texts } from '../../constants';

export const NotFoundPage = memoNamed('NotFoundPage', () => (
  <NonIdealState
    action={
      <AnchorButton href={routes.createPage} icon={'home'}>
        {texts.topPage}
      </AnchorButton>
    }
    icon={'search'}
    title={texts.pageNotFound}
  />
));
