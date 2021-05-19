import { Popover } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import { useCallback } from 'react';
import { texts } from '../../../../constants';
import type {
  DatetimeSpecificationEnumType,
  ITimeRange,
} from '../../../../types';
import { SetTimesPopoverContent } from './set-times-popover-content';

const vt = texts.eventSettingsPage.section2;

type Props = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  initialValue: ITimeRange;
  onSetTimesSubmit: (range: ITimeRange) => void;
}>;

export const SetTimesPopover = memoNamed<Props>(
  'SetTimesPopover',
  ({ datetimeSpecification, initialValue, onSetTimesSubmit }) => {
    const [isOpen, handleOpen, handleClose] = useBooleanState(false);

    const onOkClick = useCallback(
      (range: ITimeRange) => {
        onSetTimesSubmit(range);
        handleClose();
      },
      [onSetTimesSubmit, handleClose]
    );

    return (
      <Popover
        content={
          <SetTimesPopoverContent
            initialValue={initialValue}
            datetimeSpecification={datetimeSpecification}
            onCancelClick={handleClose}
            onOkClick={onOkClick}
          />
        }
        isOpen={isOpen}
        onClose={handleClose}
        canEscapeKeyClose={true}
      >
        <BpButton
          intent='success'
          onClick={handleOpen}
          text={vt.setTimesAtOneTime}
        />
      </Popover>
    );
  }
);
