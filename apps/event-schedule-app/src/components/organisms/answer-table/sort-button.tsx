import { Button, ButtonGroup, PopoverNext } from '@blueprintjs/core';
import { useBoolState } from 'better-react-use-state';
import * as React from 'react';
import { memoNamed } from 'react-utils';

type Props = Readonly<{ onSortChange: (state: 'asc' | 'desc') => void }>;

export const SortButton = memoNamed<Props>('SortButton', ({ onSortChange }) => {
  const [isOpen, { setTrue: handleOpen, setFalse: handleClose }] =
    useBoolState(false);

  const onSortAscClick = React.useCallback(() => {
    onSortChange('asc');

    handleClose();
  }, [onSortChange, handleClose]);

  const onSortDescClick = React.useCallback(() => {
    onSortChange('desc');

    handleClose();
  }, [onSortChange, handleClose]);

  const popoverContent = React.useMemo(
    () => (
      <ButtonGroup vertical>
        <Button icon={'sort-asc'} variant={'minimal'} onClick={onSortAscClick}>
          {dict.answerPage.answers.sortAsc}
        </Button>
        <Button
          icon={'sort-desc'}
          variant={'minimal'}
          onClick={onSortDescClick}
        >
          {dict.answerPage.answers.sortDesc}
        </Button>
      </ButtonGroup>
    ),
    [onSortAscClick, onSortDescClick],
  );

  return (
    <PopoverNext
      canEscapeKeyClose
      content={popoverContent}
      isOpen={isOpen}
      placement={'bottom'}
      onClose={handleClose}
    >
      <Button
        icon={'chevron-down'}
        size={'small'}
        variant={'outlined'}
        onClick={handleOpen}
      />
    </PopoverNext>
  );
});
