import { AnchorButton, NonIdealState } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import { texts } from '../../constants/texts';
import { routePaths } from '../../routing/routing';

export const NotFoundPage = memoNamed<Record<string, void>>(
  'NotFoundPage',
  () => (
    <NonIdealState
      icon={'search'}
      title={texts.pageNotFound}
      action={
        <AnchorButton href={routePaths.createPage} icon={'home'}>
          {texts.topPage}
        </AnchorButton>
      }
    />
  )
);
