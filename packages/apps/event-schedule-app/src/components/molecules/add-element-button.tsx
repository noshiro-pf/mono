import { Button } from '@blueprintjs/core';

type Props = Readonly<{
  onClick: () => void;
}>;

export const AddElementButton = memoNamed<Props>(
  'AddElementButton',
  ({ onClick }) => (
    <Button data-cy={'add-button'} fill={true} icon='plus' onClick={onClick} />
  ),
);
