import { FormGroup } from '@blueprintjs/core';
import { BpDatetimePicker } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { answerDeadlineShortcuts } from '../../constants/index.mjs';
import { useIsMobile } from '../../store/index.mjs';

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

    const isMobile = useIsMobile();

    return (
      <FormGroup
        helperText={
          showError
            ? dict.eventSettingsPage.errorMessages
                .answerDeadlineIsEnabledButEmpty
            : undefined
        }
        intent={showError ? 'danger' : 'primary'}
      >
        <BpDatetimePicker
          disabled={!useAnswerDeadline}
          shortcuts={isMobile ? false : answerDeadlineShortcuts}
          showActionsBar={false}
          ymdhm={answerDeadline}
          onYmdhmChange={onAnswerDeadlineChange}
        />
      </FormGroup>
    );
  },
);
