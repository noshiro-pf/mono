import { Button } from 'blueprint-synstate';
import { constant, type JSX } from 'synstate-dom';

type Props = Readonly<{ onClick: () => void }>;

export const AddElementButton = ({ onClick }: Props): JSX.Element => (
  <Button
    data-e2e={constant('add-button')}
    fill
    icon={'plus'}
    onClick={onClick}
  />
);
