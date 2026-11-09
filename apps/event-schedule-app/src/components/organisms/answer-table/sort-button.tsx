import { Button, ButtonGroup, Popover } from 'blueprint-synstate';
import { createBooleanState } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';

type Props = Readonly<{ onSortChange: (state: 'asc' | 'desc') => void }>;

export const SortButton = ({ onSortChange }: Props): JSX.Element => {
  const [isOpen$, { setTrue: handleOpen, setFalse: handleClose }] =
    createBooleanState(false);

  const sortBy = (order: 'asc' | 'desc') => (): void => {
    onSortChange(order);

    handleClose();
  };

  return (
    <Popover
      canEscapeKeyClose
      content={
        <ButtonGroup data-e2e={constant('sort-menu')} vertical>
          <Button
            icon={'sort-asc'}
            text={constant(dict.answerPage.answers.sortAsc)}
            variant={constant('minimal')}
            onClick={sortBy('asc')}
          />
          <Button
            icon={'sort-desc'}
            text={constant(dict.answerPage.answers.sortDesc)}
            variant={constant('minimal')}
            onClick={sortBy('desc')}
          />
        </ButtonGroup>
      }
      data-e2e={'sort-button'}
      isOpen={isOpen$}
      placement={'bottom'}
      onClose={handleClose}
    >
      <Button
        icon={'chevron-down'}
        size={'small'}
        variant={constant('outlined')}
        onClick={handleOpen}
      />
    </Popover>
  );
};
