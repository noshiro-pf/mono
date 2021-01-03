import { BpDatetimePicker, Ymdhm } from '@mono/react-blueprintjs-utils';
import { memoNamed } from '@mono/react-utils';
import { mapNullable } from '@mono/ts-utils';
import React from 'react';
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

interface Props {
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
}

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

export const EventSettings = memoNamed<Props>('EventSettings', (props) => (
  <Root>
    <ParagraphWithSwitch
      title={vt.answerDeadline}
      description={vt.howAnswerDeadlineIsUsed}
      show={props.useAnswerDeadline}
      onToggle={props.onToggleAnswerDeadline}
      elementToToggle={
        <BpDatetimePicker
          ymdhm={toYmdhm(props.answerDeadline)}
          onYmdhmChange={onYmdHmChangeFn(props.onAnswerDeadlineChange)}
          disabled={!props.useAnswerDeadline}
        />
      }
    />
    <hr />
    <ParagraphWithSwitch
      title={vt.useNotification}
      show={props.useNotification}
      onToggle={props.onToggleUseNotification}
      elementToToggle={
        <NotificationSettings
          notificationSettings={props.notificationSettings}
          onNotificationSettingsChange={props.onNotificationSettingsChange}
          disabled={!props.useNotification}
          useAnswerDeadline={props.useAnswerDeadline}
        />
      }
    />
    <hr />
    <ParagraphWithSwitch
      title={vt.symbolSettings}
      show={props.customizeSymbolSettings}
      onToggle={props.onToggleCustomizeSymbolSettings}
      elementToToggle={
        <SymbolSettings
          answerSymbolList={props.answerSymbolList}
          onAnswerSymbolListChange={props.onAnswerSymbolListChange}
          disabled={!props.customizeSymbolSettings}
        />
      }
    />
  </Root>
));

const Root = styled.div`
  padding: 10px;

  & > * {
    margin-bottom: 15px;
  }
`;
