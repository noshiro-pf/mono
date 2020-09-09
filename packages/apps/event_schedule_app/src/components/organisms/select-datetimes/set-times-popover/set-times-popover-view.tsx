import { Button, Popover } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { texts } from '../../../../constants/texts';
import { DatetimeSpecificationEnumType } from '../../../../types/enum/datetime-specification-type';
import { ITimeRangeType } from '../../../../types/record/time-range';
import { SetTimesPopoverContent } from './set-times-popover-content';

const vt = texts.createEventPage.section2;

export const SetTimesPopoverView = memoNamed<{
  initialValue: ITimeRangeType;
  datetimeSpecification: DatetimeSpecificationEnumType;
  isOpen: boolean;
  onOpenClick: () => void;
  onClose: () => void;
  onCancelClick: () => void;
  onOkClick: (timeRange: ITimeRangeType) => void;
}>(
  'SetTimesPopoverView',
  ({
    initialValue,
    datetimeSpecification,
    isOpen,
    onClose,
    onOpenClick,
    onCancelClick,
    onOkClick,
  }) => (
    <Popover
      target={
        <Button
          intent='success'
          onClick={onOpenClick}
          text={vt.setTimesAtOneTime}
        />
      }
      content={
        <SetTimesPopoverContent
          initialValue={initialValue}
          datetimeSpecification={datetimeSpecification}
          onCancelClick={onCancelClick}
          onOkClick={onOkClick}
        />
      }
      isOpen={isOpen}
      onClose={onClose}
      canEscapeKeyClose={true}
    />
  )
);
