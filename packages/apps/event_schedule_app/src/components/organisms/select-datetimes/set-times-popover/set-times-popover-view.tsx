import { Popover } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { texts } from '../../../../constants/texts';
import { DatetimeSpecificationEnumType } from '../../../../types/enum/datetime-specification-type';
import { ITimeRange } from '../../../../types/record/time-range';
import { BpButton } from '../../../atoms/blueprint-js-wrapper/button';
import { SetTimesPopoverContent } from './set-times-popover-content';

const vt = texts.createEventPage.section2;

interface Props {
  initialValue: ITimeRange;
  datetimeSpecification: DatetimeSpecificationEnumType;
  isOpen: boolean;
  onOpenClick: () => void;
  onClose: () => void;
  onCancelClick: () => void;
  onOkClick: (timeRange: ITimeRange) => void;
}

export const SetTimesPopoverView = memoNamed<Props>(
  'SetTimesPopoverView',
  (props) => (
    <Popover
      target={
        <BpButton
          intent='success'
          onClick={props.onOpenClick}
          text={vt.setTimesAtOneTime}
        />
      }
      content={
        <SetTimesPopoverContent
          initialValue={props.initialValue}
          datetimeSpecification={props.datetimeSpecification}
          onCancelClick={props.onCancelClick}
          onOkClick={props.onOkClick}
        />
      }
      isOpen={props.isOpen}
      onClose={props.onClose}
      canEscapeKeyClose={true}
    />
  )
);
