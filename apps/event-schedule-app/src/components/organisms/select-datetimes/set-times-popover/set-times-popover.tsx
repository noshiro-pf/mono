import { Button, Popover } from 'blueprint-synstate';
import { createBooleanState, type InitializedObservable } from 'synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../../../constants/index.mjs';
import type { SetTimesSubmission } from '../../../../hooks/index.mjs';
import { SetTimesPopoverContent } from './set-times-popover-content.js';

const dc = dict.eventSettingsPage.section2;

type Props = Readonly<{
  datetimeSpecification: Bindable<DatetimeSpecificationEnumType>;
  initialValue: InitializedObservable<TimeRange>;
  onSetTimesSubmit: (state: SetTimesSubmission) => void;
}>;

export const SetTimesPopover = ({
  datetimeSpecification,
  initialValue,
  onSetTimesSubmit,
}: Props): JSX.Element => {
  const [isOpen$, { setTrue: handleOpen, setFalse: handleClose }] =
    createBooleanState(false);

  return (
    <Popover
      canEscapeKeyClose
      content={
        <SetTimesPopoverContent
          datetimeSpecification={datetimeSpecification}
          initialValue={initialValue}
          isOpen={isOpen$}
          onCancelClick={handleClose}
          onOkClick={(state) => {
            onSetTimesSubmit(state);

            handleClose();
          }}
        />
      }
      data-e2e={'set-times-button'}
      isOpen={isOpen$}
      onClose={handleClose}
    >
      <Button
        intent={'success'}
        text={constant(dc.setTimesAtOneTime)}
        onClick={handleOpen}
      />
    </Popover>
  );
};
