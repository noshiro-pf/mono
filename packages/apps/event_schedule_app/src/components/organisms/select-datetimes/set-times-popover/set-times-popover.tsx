import { memoNamed, useBooleanState } from '@mono/react-utils';
import React, { useCallback } from 'react';
import { DatetimeSpecificationEnumType } from '../../../../types/enum/datetime-specification-type';
import { ITimeRangeType } from '../../../../types/record/time-range';
import { SetTimesPopoverView } from './set-times-popover-view';

export const SetTimesPopover = memoNamed<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  initialValue: ITimeRangeType;
  onSetTimesSubmit: (range: ITimeRangeType) => void;
}>(
  'SetTimesPopover',
  ({ datetimeSpecification, initialValue, onSetTimesSubmit }) => {
    const [isOpen, open, close] = useBooleanState(false);

    const onOkClick = useCallback(
      (range: ITimeRangeType) => {
        onSetTimesSubmit(range);
        close();
      },
      [onSetTimesSubmit, close]
    );

    return (
      <SetTimesPopoverView
        initialValue={initialValue}
        datetimeSpecification={datetimeSpecification}
        isOpen={isOpen}
        onOpenClick={open}
        onClose={close}
        onCancelClick={close}
        onOkClick={onOkClick}
      />
    );
  }
);
