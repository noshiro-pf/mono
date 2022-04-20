import { Button } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { SetTimesPopoverContent } from './set-times-popover-content';

const dc = dict.eventSettingsPage.section2;

type Props = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  initialValue: TimeRange;
  onSetTimesSubmit: (range: TimeRange) => void;
}>;

export const SetTimesPopover = memoNamed<Props>(
  'SetTimesPopover',
  ({ datetimeSpecification, initialValue, onSetTimesSubmit }) => {
    const {
      state: isOpen,
      setTrue: handleOpen,
      setFalse: handleClose,
    } = useBoolState(false);

    const onOkClick = useCallback(
      (range: TimeRange) => {
        onSetTimesSubmit(range);
        handleClose();
      },
      [onSetTimesSubmit, handleClose]
    );

    return (
      <Popover2
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
      </Popover2>
    );
  }
);
