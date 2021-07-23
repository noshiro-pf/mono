import { Popover } from '@blueprintjs/core';
import type {
  DatetimeSpecificationEnumType,
  TimeRange,
} from '@noshiro/event-schedule-app-shared';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import { useCallback } from 'react';
import { texts } from '../../../../constants';
import { SetTimesPopoverContent } from './set-times-popover-content';

const vt = texts.eventSettingsPage.section2;

type Props = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  initialValue: TimeRange;
  onSetTimesSubmit: (range: TimeRange) => void;
}>;

export const SetTimesPopover = memoNamed<Props>(
  'SetTimesPopover',
  ({ datetimeSpecification, initialValue, onSetTimesSubmit }) => {
    const [isOpen, handleOpen, handleClose] = useBooleanState(false);

    const onOkClick = useCallback(
      (range: TimeRange) => {
        onSetTimesSubmit(range);
        handleClose();
      },
      [onSetTimesSubmit, handleClose]
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
        <BpButton
          intent='success'
          text={vt.setTimesAtOneTime}
          onClick={handleOpen}
        />
      </Popover>
    );
  }
);
