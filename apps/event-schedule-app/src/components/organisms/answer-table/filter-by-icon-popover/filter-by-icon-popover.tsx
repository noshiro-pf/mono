import { PopoverNext } from '@blueprintjs/core';
import { useBoolState } from 'better-react-use-state';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { type SafeUint } from 'ts-type-forge';
import { AnswerFilterAndSortStore } from '../../../../store/index.mjs';
import { CustomIconButton } from '../../../molecules/index.mjs';
import { FilterByIconPopoverContent } from './filter-by-icon-popover-content.js';

const dc = dict.answerPage.answers;

type Props = Readonly<{ answerIconId: AnswerIconId }>;

export const FilterByIconPopover = memoNamed<Props>(
  'FilterByIconPopover',
  ({ answerIconId }) => {
    const [isOpen, { setTrue: handleOpen, setFalse: handleClose }] =
      useBoolState(false);

    const turnOnFilteringEnabled = React.useCallback(() => {
      AnswerFilterAndSortStore.enableFilteringByIcon(answerIconId);
    }, [answerIconId]);

    const turnOffFilteringEnabled = React.useCallback(() => {
      AnswerFilterAndSortStore.disableFilteringByIcon(answerIconId);

      AnswerFilterAndSortStore.disableFilteringByIcon(answerIconId);
    }, [answerIconId]);

    const filterState = AnswerFilterAndSortStore.useFilterState();

    const state = filterState.iconState[answerIconId];

    const upperLimit = filterState.iconState.upperLimit;

    const onMinChange = React.useCallback(
      (value: SafeUint) => {
        AnswerFilterAndSortStore.setMinCountOfIcon(answerIconId, value);
      },
      [answerIconId],
    );

    const onMaxChange = React.useCallback(
      (value: SafeUint) => {
        AnswerFilterAndSortStore.setMaxCountOfIcon(answerIconId, value);
      },
      [answerIconId],
    );

    const popoverContent = React.useMemo(
      () => (
        <FilterByIconPopoverContent
          disableFiltering={turnOffFilteringEnabled}
          enableFiltering={turnOnFilteringEnabled}
          state={state}
          upperLimit={upperLimit}
          onClose={handleClose}
          onMaxChange={onMaxChange}
          onMinChange={onMinChange}
        />
      ),
      [
        handleClose,
        onMaxChange,
        onMinChange,
        state,
        turnOffFilteringEnabled,
        turnOnFilteringEnabled,
        upperLimit,
      ],
    );

    return (
      <PopoverNext
        canEscapeKeyClose
        content={popoverContent}
        isOpen={isOpen}
        placement={'bottom'}
        onClose={handleClose}
      >
        <CustomIconButton
          active={state.enabled}
          iconName={answerIconId}
          outlined
          title={dc.iconHeaderFilter[answerIconId].title}
          onClick={handleOpen}
        />
      </PopoverNext>
    );
  },
);
