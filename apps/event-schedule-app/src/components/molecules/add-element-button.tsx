import { Button } from '@blueprintjs/core';
import { memoNamed } from 'react-utils';

type Props = Readonly<{ onClick: () => void }>;

export const AddElementButton = memoNamed<Props>(
  'AddElementButton',
  ({ onClick }) => (
    <Button data-e2e={'add-button'} fill icon={'plus'} onClick={onClick} />
  ),
);
