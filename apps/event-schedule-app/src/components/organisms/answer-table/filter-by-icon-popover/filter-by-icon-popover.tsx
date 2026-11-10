import { Popover } from 'blueprint-synstate';
import { createBooleanState, map } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { dict } from '../../../../constants/index.mjs';
import { AnswerFilterAndSortStore } from '../../../../store/index.mjs';
import { CustomIconButton } from '../../../molecules/index.mjs';
import { FilterByIconPopoverContent } from './filter-by-icon-popover-content.js';

const dc = dict.answerPage.answers;

type Props = Readonly<{ answerIconId: AnswerIconId }>;

export const FilterByIconPopover = ({ answerIconId }: Props): JSX.Element => {
  const [isOpen$, { setTrue: handleOpen, setFalse: handleClose }] =
    createBooleanState(false);

  const state = AnswerFilterAndSortStore.filterState$.pipe(
    map((s) => s.iconState[answerIconId]),
  );

  return (
    <Popover
      canEscapeKeyClose
      content={
        <FilterByIconPopoverContent
          disableFiltering={() => {
            AnswerFilterAndSortStore.disableFilteringByIcon(answerIconId);
          }}
          enableFiltering={() => {
            AnswerFilterAndSortStore.enableFilteringByIcon(answerIconId);
          }}
          state={state}
          upperLimit={AnswerFilterAndSortStore.filterState$.pipe(
            map((s) => s.iconState.upperLimit),
          )}
          onClose={handleClose}
          onMaxChange={(value) => {
            AnswerFilterAndSortStore.setMaxCountOfIcon(answerIconId, value);
          }}
          onMinChange={(value) => {
            AnswerFilterAndSortStore.setMinCountOfIcon(answerIconId, value);
          }}
        />
      }
      data-e2e={`icon-filter-${answerIconId}`}
      isOpen={isOpen$}
      placement={'bottom'}
      onClose={handleClose}
    >
      <CustomIconButton
        active={AnswerFilterAndSortStore.filterState$.pipe(
          map((s) => s.iconState[answerIconId].enabled),
        )}
        iconName={answerIconId}
        outlined
        title={constant(dc.iconHeaderFilter[answerIconId].title)}
        onClick={handleOpen}
      />
    </Popover>
  );
};
