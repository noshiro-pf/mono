import { Button, Popover } from '@blueprintjs/core';
import { SetTimesPopoverContent } from './set-times-popover-content';

const dc = dict.eventSettingsPage.section2;

type Props = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  initialValue: TimeRange;
  onSetTimesSubmit: (
    state: Readonly<{
      timeRange: TimeRange;
      checkboxState: Record<DayOfWeekName, boolean>;
    }>,
  ) => void;
}>;

export const SetTimesPopover = memoNamed<Props>(
  'SetTimesPopover',
  ({ datetimeSpecification, initialValue, onSetTimesSubmit }) => {
    const [isOpen, { setTrue: handleOpen, setFalse: handleClose }] =
      useBoolState(false);

    const onOkClick = useCallback(
      (
        state: Readonly<{
          timeRange: TimeRange;
          checkboxState: Record<DayOfWeekName, boolean>;
        }>,
      ) => {
        onSetTimesSubmit(state);
        handleClose();
      },
      [onSetTimesSubmit, handleClose],
    );

    return (
      <Popover
        canEscapeKeyClose={true}
        content={
          <SetTimesPopoverContent
            datetimeSpecification={datetimeSpecification}
            initialValue={initialValue}
            onCancelClick={handleClose}
            onOkClick={onOkClick}
          />
        }
        isOpen={isOpen}
        onClose={handleClose}
      >
        <Button
          intent='success'
          text={dc.setTimesAtOneTime}
          onClick={handleOpen}
        />
      </Popover>
    );
  },
);
