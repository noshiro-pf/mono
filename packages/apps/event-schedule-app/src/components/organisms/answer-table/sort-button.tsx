import { Button, ButtonGroup, Popover } from '@blueprintjs/core';

type Props = Readonly<{
  onSortChange: (state: 'asc' | 'desc') => void;
}>;

export const SortButton = memoNamed<Props>('SortButton', ({ onSortChange }) => {
  const [isOpen, { setTrue: handleOpen, setFalse: handleClose }] =
    useBoolState(false);

  const onSortAscClick = useCallback(() => {
    onSortChange('asc');
    handleClose();
  }, [onSortChange, handleClose]);

  const onSortDescClick = useCallback(() => {
    onSortChange('desc');
    handleClose();
  }, [onSortChange, handleClose]);

  const popoverContent = useMemo(
    () => (
      <ButtonGroup vertical={true}>
        <Button icon={'sort-asc'} minimal={true} onClick={onSortAscClick}>
          {dict.answerPage.answers.sortAsc}
        </Button>
        <Button icon={'sort-desc'} minimal={true} onClick={onSortDescClick}>
          {dict.answerPage.answers.sortDesc}
        </Button>
      </ButtonGroup>
    ),
    [onSortAscClick, onSortDescClick],
  );

  return (
    <Popover
      canEscapeKeyClose={true}
      content={popoverContent}
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
