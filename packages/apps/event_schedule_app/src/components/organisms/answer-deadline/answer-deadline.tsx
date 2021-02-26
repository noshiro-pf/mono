import { FormGroup } from '@blueprintjs/core';
import { BpDatetimePicker, Ymdhm } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { mapNullable } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import { answerDeadlineShortcuts } from '../../../constants/answer-deadline-shortcuts';
import { texts } from '../../../constants/texts';
import { createIHoursMinutes } from '../../../types/record/base/hours-minutes';
import { createIYearMonthDate } from '../../../types/record/base/year-month-date';
import { createIYmdHm, IYmdHm } from '../../../types/record/ymd-hm';

type Props = Readonly<{
  useAnswerDeadline: boolean;
  answerDeadline: IYmdHm | undefined;
  onAnswerDeadlineChange: (value: IYmdHm | undefined) => void;
}>;

const toYmdhm = mapNullable<IYmdHm, Ymdhm>(({ ymd, hm }) => ({
  year: ymd.year,
  month: ymd.month,
  date: ymd.date,
  hours: hm.hours,
  minutes: hm.minutes,
}));

const onYmdHmChangeFn = (
  onIYmdChange: (iymdhm: IYmdHm | undefined) => void
) => (ymdhm: Ymdhm | undefined): void => {
  onIYmdChange(
    mapNullable((_ymdhm: Ymdhm) =>
      createIYmdHm({
        ymd: createIYearMonthDate(_ymdhm),
        hm: createIHoursMinutes(_ymdhm),
      })
    )(ymdhm)
  );
};

export const AnswerDeadlineDatepicker = memoNamed<Props>(
  'AnswerDeadlineDatepicker',
  ({ useAnswerDeadline, answerDeadline, onAnswerDeadlineChange }) => {
    const answerDeadlineYmdhm = useMemo(() => toYmdhm(answerDeadline), [
      answerDeadline,
    ]);

    const showError: boolean =
      useAnswerDeadline && answerDeadline === undefined;

    const onYmdhmChange = useCallback(
      (ymdhm: Ymdhm | undefined) => {
        onYmdHmChangeFn(onAnswerDeadlineChange)(ymdhm);
      },
      [onAnswerDeadlineChange]
    );

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
          ymdhm={answerDeadlineYmdhm}
          onYmdhmChange={onYmdhmChange}
          disabled={!useAnswerDeadline}
          showActionsBar={false}
          shortcuts={answerDeadlineShortcuts}
        />
      </FormGroup>
    );
  }
);
