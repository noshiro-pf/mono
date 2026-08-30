import { Button, PopoverNext } from '@blueprintjs/core';
import { useBoolState } from 'better-react-use-state';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { type DayOfWeekName, type ReadonlyRecord } from 'ts-type-forge';
import { SetTimesPopoverContent } from './set-times-popover-content.js';

const dc = dict.eventSettingsPage.section2;

type Props = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  initialValue: TimeRange;
  onSetTimesSubmit: (
    state: Readonly<{
      timeRange: TimeRange;
      checkboxState: ReadonlyRecord<DayOfWeekName, boolean>;
    }>,
  ) => void;
}>;

export const SetTimesPopover = memoNamed<Props>(
  'SetTimesPopover',
  ({ datetimeSpecification, initialValue, onSetTimesSubmit }) => {
    const [isOpen, { setTrue: handleOpen, setFalse: handleClose }] =
      useBoolState(false);

    const onOkClick = React.useCallback(
      (
        state: Readonly<{
          timeRange: TimeRange;
          checkboxState: ReadonlyRecord<DayOfWeekName, boolean>;
        }>,
      ) => {
        onSetTimesSubmit(state);

        handleClose();
      },
      [onSetTimesSubmit, handleClose],
    );

    const popoverContent = React.useMemo(
      () => (
        <SetTimesPopoverContent
          datetimeSpecification={datetimeSpecification}
          initialValue={initialValue}
          onCancelClick={handleClose}
          onOkClick={onOkClick}
        />
      ),
      [datetimeSpecification, handleClose, initialValue, onOkClick],
    );

    return (
      <PopoverNext
        canEscapeKeyClose
        content={popoverContent}
        isOpen={isOpen}
        onClose={handleClose}
      >
        <Button
          intent={'success'}
          text={dc.setTimesAtOneTime}
          onClick={handleOpen}
        />
      </PopoverNext>
    );
  },
);
