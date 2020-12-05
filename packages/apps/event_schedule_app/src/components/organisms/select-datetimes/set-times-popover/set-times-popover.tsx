import { memoNamed, useBooleanState } from '@mono/react-utils';
import React, { useCallback } from 'react';
import { DatetimeSpecificationEnumType } from '../../../../types/enum/datetime-specification-type';
import { ITimeRange } from '../../../../types/record/time-range';
import { SetTimesPopoverView } from './set-times-popover-view';

interface Props {
  datetimeSpecification: DatetimeSpecificationEnumType;
  initialValue: ITimeRange;
  onSetTimesSubmit: (range: ITimeRange) => void;
}

export const SetTimesPopover = memoNamed<Props>(
  'SetTimesPopover',
  ({ datetimeSpecification, initialValue, onSetTimesSubmit }) => {
    const [isOpen, open, close] = useBooleanState(false);

    const onOkClick = useCallback(
      (range: ITimeRange) => {
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
