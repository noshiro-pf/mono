import { Button } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { AnswerTableFilteringAndSortingManager } from '../../../../store';
import { CustomIcon } from '../../../atoms';
import { FilterByIconPopoverContent } from './filter-by-icon-popover-content';

const dc = dict.answerPage.answers;

type Props = Readonly<{
  answerIconId: AnswerIconId;
}>;

export const FilterByIconPopover = memoNamed<Props>(
  'FilterByIconPopover',
  ({ answerIconId }) => {
    const {
      state: isOpen,
      setTrue: handleOpen,
      setFalse: handleClose,
    } = useBoolState(false);

    const turnOnFilteringEnabled = useCallback(() => {
      AnswerTableFilteringAndSortingManager.enableFilteringAnswerTableOfIcon(
        answerIconId
      );
    }, [answerIconId]);

    const turnOffFilteringEnabled = useCallback(() => {
      AnswerTableFilteringAndSortingManager.disableFilteringAnswerTableOfIcon(
        answerIconId
      );
      AnswerTableFilteringAndSortingManager.disableFilteringAnswerTableOfIcon(
        answerIconId
      );
    }, [answerIconId]);

    const answerTableFilteringState = useObservableValue(
      AnswerTableFilteringAndSortingManager.answerTableFilteringState$
    );

    const state = answerTableFilteringState[answerIconId];
    const upperLimit = answerTableFilteringState.upperLimit;

    const onMinChange = useCallback(
      (value: number) => {
        AnswerTableFilteringAndSortingManager.setMinCountOfIconAnswerTable(
          answerIconId,
          value
        );
      },
      [answerIconId]
    );

    const onMaxChange = useCallback(
      (value: number) => {
        AnswerTableFilteringAndSortingManager.setStateAnswerTableFilteringIconMax(
          answerIconId,
          value
        );
      },
      [answerIconId]
    );

    return (
      <Popover2
        canEscapeKeyClose={true}
        content={
          <FilterByIconPopoverContent
            disableFiltering={turnOffFilteringEnabled}
            enableFiltering={turnOnFilteringEnabled}
            state={state}
            upperLimit={upperLimit}
            onClose={handleClose}
            onMaxChange={onMaxChange}
            onMinChange={onMinChange}
          />
        }
        isOpen={isOpen}
        minimal={false}
        placement={'bottom'}
        onClose={handleClose}
      >
        <Button
          active={state.filteringEnabled}
          icon={<CustomIcon iconName={answerIconId} />}
          minimal={true}
          outlined={true}
          title={dc.iconHeaderFilter[answerIconId].title}
          onClick={handleOpen}
        />
      </Popover2>
    );
  }
);
