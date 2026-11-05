import { FormGroup } from '@blueprintjs/core';
import * as React from 'react';
import { BpDatetimePicker } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { compareYearMonthDate, DateUtils } from 'ts-fortress-types';
import { createAnswerDeadlineShortcuts, dict } from '../../constants/index.mjs';
import { useIsMobile } from '../../store/index.mjs';
import { todayYearMonthDate } from '../../utils/index.mjs';

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

    // The day the shortcuts count from, read again each time the picker opens:
    // the page may have been open since an earlier day.
    const [today, setToday] = React.useState<YearMonthDate>(todayYearMonthDate);

    const shortcuts = React.useMemo(
      () =>
        createAnswerDeadlineShortcuts(
          DateUtils.create(today.year, today.month, today.date),
        ),
      [today],
    );

    const popoverProps = React.useMemo(
      () => ({
        onOpening: () => {
          const next = todayYearMonthDate();

          setToday((prev) =>
            compareYearMonthDate(prev, next) === 0 ? prev : next,
          );
        },
      }),
      [],
    );

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
          popoverProps={isMobile ? undefined : popoverProps}
          shortcuts={isMobile ? false : shortcuts}
          showActionsBar={false}
          ymdhm={answerDeadline}
          onYmdhmChange={onAnswerDeadlineChange}
        />
      </FormGroup>
    );
  },
);
