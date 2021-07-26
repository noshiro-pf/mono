import { FormGroup } from '@blueprintjs/core';
import type { Ymdhm } from '@noshiro/event-schedule-app-shared';
import { BpDatetimePicker } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { answerDeadlineShortcuts, texts } from '../../../constants';

type Props = Readonly<{
  useAnswerDeadline: boolean;
  answerDeadline: Ymdhm | undefined;
  onAnswerDeadlineChange: (value: Ymdhm | undefined) => void;
}>;

export const AnswerDeadlineDatepicker = memoNamed<Props>(
  'AnswerDeadlineDatepicker',
  ({ useAnswerDeadline, answerDeadline, onAnswerDeadlineChange }) => {
    const showError: boolean =
      useAnswerDeadline && answerDeadline === undefined;

    return (
      <FormGroup
        helperText={
          showError
            ? texts.eventSettingsPage.errorMessages
                .answerDeadlineIsEnabledButEmpty
            : undefined
        }
        intent={showError ? 'danger' : 'primary'}
      >
        <BpDatetimePicker
          disabled={!useAnswerDeadline}
          shortcuts={answerDeadlineShortcuts}
          showActionsBar={false}
          ymdhm={answerDeadline}
          onYmdhmChange={onAnswerDeadlineChange}
        />
      </FormGroup>
    );
  }
);
