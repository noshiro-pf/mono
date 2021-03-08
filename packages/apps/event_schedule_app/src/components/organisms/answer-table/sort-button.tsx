import { ButtonGroup, Popover } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import { useCallback } from 'react';
import { texts } from '../../../constants/texts';

interface Props {
  onSortChange: (state: 'asc' | 'desc') => void;
}

export const SortButton = memoNamed<Props>('SortButton', ({ onSortChange }) => {
  const [isOpen, open, close] = useBooleanState(false);

  const onSortAscClick = useCallback(() => {
    onSortChange('asc');
    close();
  }, [onSortChange, close]);

  const onSortDescClick = useCallback(() => {
    onSortChange('desc');
    close();
  }, [onSortChange, close]);

  return (
    <Popover
      isOpen={isOpen}
      onClose={close}
      canEscapeKeyClose={true}
      position={'bottom'}
      target={
        <BpButton
          minimal={true}
          icon={'chevron-down'}
          outlined={true}
          small={true}
          onClick={open}
        />
      }
      content={
        <ButtonGroup vertical={true}>
          <BpButton icon='sort-asc' minimal={true} onClick={onSortAscClick}>
            {texts.answerPage.answers.sortAsc}
          </BpButton>
          <BpButton icon='sort-desc' minimal={true} onClick={onSortDescClick}>
            {texts.answerPage.answers.sortDesc}
          </BpButton>
        </ButtonGroup>
      }
    ></Popover>
  );
});
