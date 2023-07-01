import { Button, ButtonGroup, Popover } from '@blueprintjs/core';

type Props = Readonly<{
  onSortChange: (state: 'asc' | 'desc') => void;
}>;

export const SortButton = memoNamed<Props>('SortButton', ({ onSortChange }) => {
  const {
    state: isOpen,
    setTrue: handleOpen,
    setFalse: handleClose,
  } = useBoolState(false);

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
            {dict.answerPage.answers.sortAsc}
          </Button>
          <Button icon='sort-desc' minimal={true} onClick={onSortDescClick}>
            {dict.answerPage.answers.sortDesc}
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
