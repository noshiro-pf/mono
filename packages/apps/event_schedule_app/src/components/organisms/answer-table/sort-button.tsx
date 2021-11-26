import { Button, ButtonGroup, Popover } from '@blueprintjs/core';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import { useCallback } from 'react';
import { texts } from '../../../constants';

type Props = Readonly<{
  onSortChange: (state: 'asc' | 'desc') => void;
}>;

export const SortButton = memoNamed<Props>('SortButton', ({ onSortChange }) => {
  const [isOpen, handleOpen, handleClose] = useBooleanState(false);

  const onSortAscClick = useCallback(() => {
    onSortChange('asc');
    handleClose();
  }, [onSortChange, handleClose]);

  const onSortDescClick = useCallback(() => {
    onSortChange('desc');
    handleClose();
  }, [onSortChange, handleClose]);

  return (
    <Popover
      canEscapeKeyClose={true}
      content={
        <ButtonGroup vertical={true}>
          <Button icon='sort-asc' minimal={true} onClick={onSortAscClick}>
            {texts.answerPage.answers.sortAsc}
          </Button>
          <Button icon='sort-desc' minimal={true} onClick={onSortDescClick}>
            {texts.answerPage.answers.sortDesc}
          </Button>
        </ButtonGroup>
      }
      isOpen={isOpen}
      placement={'bottom'}
      onClose={handleClose}
    >
      <Button
        icon={'chevron-down'}
        minimal={true}
        outlined={true}
        small={true}
        onClick={handleOpen}
      />
    </Popover>
  );
});
