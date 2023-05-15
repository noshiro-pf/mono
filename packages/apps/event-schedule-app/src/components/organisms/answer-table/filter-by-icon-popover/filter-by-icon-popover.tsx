import { Popover2 } from '@blueprintjs/popover2';
import { AnswerFilterAndSortStore } from '../../../../store';
import { CustomIconButton } from '../../../bp';
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
      AnswerFilterAndSortStore.enableFilteringByIcon(answerIconId);
    }, [answerIconId]);

    const turnOffFilteringEnabled = useCallback(() => {
      AnswerFilterAndSortStore.disableFilteringByIcon(answerIconId);
      AnswerFilterAndSortStore.disableFilteringByIcon(answerIconId);
    }, [answerIconId]);

    const filterState = useObservableValue(
      AnswerFilterAndSortStore.filterState$
    );

    const state = filterState.iconState[answerIconId];
    const upperLimit = filterState.iconState.upperLimit;

    const onMinChange = useCallback(
      (value: number) => {
        AnswerFilterAndSortStore.setMinCountOfIcon(answerIconId, value);
      },
      [answerIconId]
    );

    const onMaxChange = useCallback(
      (value: number) => {
        AnswerFilterAndSortStore.setMaxCountOfIcon(answerIconId, value);
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
        <CustomIconButton
          active={state.enabled}
          iconName={answerIconId}
          outlined={true}
          title={dc.iconHeaderFilter[answerIconId].title}
          onClick={handleOpen}
        />
      </Popover2>
    );
  }
);
