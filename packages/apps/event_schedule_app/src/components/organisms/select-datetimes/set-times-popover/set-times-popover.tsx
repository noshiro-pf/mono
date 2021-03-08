import { Popover } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import { useCallback } from 'react';
import { texts } from '../../../../constants/texts';
import { DatetimeSpecificationEnumType } from '../../../../types/enum/datetime-specification-type';
import { ITimeRange } from '../../../../types/record/time-range';
import { SetTimesPopoverContent } from './set-times-popover-content';

const vt = texts.eventSettingsPage.section2;

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
      <Popover
        target={
          <BpButton
            intent='success'
            onClick={open}
            text={vt.setTimesAtOneTime}
          />
        }
        content={
          <SetTimesPopoverContent
            initialValue={initialValue}
            datetimeSpecification={datetimeSpecification}
            onCancelClick={close}
            onOkClick={onOkClick}
          />
        }
        isOpen={isOpen}
        onClose={close}
        canEscapeKeyClose={true}
      />
    );
  }
);
