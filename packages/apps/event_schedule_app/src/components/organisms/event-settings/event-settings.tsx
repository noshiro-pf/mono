import { BpDatetimePicker, Ymdhm } from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useTinyObservable } from '@noshiro/react-utils';
import { mapNullable } from '@noshiro/ts-utils';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { IAnswerSymbol } from '../../../types/record/base/answer-symbol';
import { createIHoursMinutes } from '../../../types/record/base/hours-minutes';
import { INotificationSettings } from '../../../types/record/base/notification-settings';
import { createIYearMonthDate } from '../../../types/record/base/year-month-date';
import { createIYmdHm, IYmdHm } from '../../../types/record/ymd-hm';
import { IList } from '../../../utils/immutable';
import { NotificationSettings } from '../notification-settings/notification-settings';
import { SymbolSettings } from '../symbol-settings/symbol-settings';
import { ParagraphWithSwitch } from './paragraph-with-switch';

const vt = texts.eventSettingsPage.section3;

type Props = Readonly<{
  useAnswerDeadline: boolean;
  onToggleAnswerDeadline: () => void;
  answerDeadline: IYmdHm | undefined;
  onAnswerDeadlineChange: (value: IYmdHm | undefined) => void;
  customizeSymbolSettings: boolean;
  onToggleCustomizeSymbolSettings: () => void;
  answerSymbolList: IList<IAnswerSymbol>;
  onAnswerSymbolListChange: (value: IList<IAnswerSymbol>) => void;
  useNotification: boolean;
  onToggleUseNotification: () => void;
  notificationSettings: INotificationSettings;
  onNotificationSettingsChange: (value: INotificationSettings) => void;
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
    mapNullable((ymdhm: Ymdhm) =>
      createIYmdHm({
        ymd: createIYearMonthDate(ymdhm),
        hm: createIHoursMinutes(ymdhm),
      })
    )(ymdhm)
  );
};

export const EventSettings = memoNamed<Props>(
  'EventSettings',
  ({
    useAnswerDeadline,
    onToggleAnswerDeadline,
    answerDeadline,
    onAnswerDeadlineChange,
    customizeSymbolSettings,
    onToggleCustomizeSymbolSettings,
    answerSymbolList,
    onAnswerSymbolListChange,
    useNotification,
    onToggleUseNotification,
    notificationSettings,
    onNotificationSettingsChange,
  }) => {
    const focusEmailInput$ = useTinyObservable<undefined>();

    const [clickedMoreThanOnce, setClickedMoreThanOnce] = useState<boolean>(
      false
    );

    const onToggleUseNotificationLocal = useCallback(() => {
      onToggleUseNotification();
      setClickedMoreThanOnce(true);
    }, [onToggleUseNotification]);

    useEffect(() => {
      if (useNotification && clickedMoreThanOnce) {
        focusEmailInput$.next(undefined);
      }
    }, [useNotification, focusEmailInput$, clickedMoreThanOnce]);

    return (
      <Root>
        <ParagraphWithSwitch
          title={vt.answerDeadline}
          description={vt.howAnswerDeadlineIsUsed}
          show={useAnswerDeadline}
          onToggle={onToggleAnswerDeadline}
          elementToToggle={
            <BpDatetimePicker
              ymdhm={toYmdhm(answerDeadline)}
              onYmdhmChange={onYmdHmChangeFn(onAnswerDeadlineChange)}
              disabled={!useAnswerDeadline}
            />
          }
        />
        <hr />
        <ParagraphWithSwitch
          title={vt.useNotification}
          show={useNotification}
          onToggle={onToggleUseNotificationLocal}
          elementToToggle={
            <NotificationSettings
              notificationSettings={notificationSettings}
              onNotificationSettingsChange={onNotificationSettingsChange}
              disabled={!useNotification}
              useAnswerDeadline={useAnswerDeadline}
              focusEmailInput$={focusEmailInput$}
            />
          }
        />
        <hr />
        <ParagraphWithSwitch
          title={vt.symbolSettings}
          show={customizeSymbolSettings}
          onToggle={onToggleCustomizeSymbolSettings}
          elementToToggle={
            <SymbolSettings
              answerSymbolList={answerSymbolList}
              onAnswerSymbolListChange={onAnswerSymbolListChange}
              disabled={!customizeSymbolSettings}
            />
          }
        />
      </Root>
    );
  }
);

const Root = styled.div`
  padding: 10px;

  & > * {
    margin-bottom: 15px;
  }
`;
