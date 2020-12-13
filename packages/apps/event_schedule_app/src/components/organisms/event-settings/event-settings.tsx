import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { IAnswerSymbol } from '../../../types/record/base/answer-symbol';
import { INotificationSettings } from '../../../types/record/base/notification-settings';
import { IYmdHm } from '../../../types/record/ymd-hm';
import { IList } from '../../../utils/immutable';
import { BpDatetimePicker } from '../../atoms/blueprint-js-wrapper/bp-datetime-picker';
import { NotificationSettings } from '../notification-settings/notification-settings';
// import { WidthRestrictedInputWrapper } from '../../styled/width-restricted-input-wrapper';
import { SymbolSettings } from '../symbol-settings/symbol-settings';
// import { BpPasswordInput } from '../../molecules/bp-password-input';
import { ParagraphWithSwitch } from './paragraph-with-switch';

const vt = texts.createEventPage.section3;

interface Props {
  useAnswerDeadline: boolean;
  onToggleAnswerDeadline: () => void;
  answerDeadline: IYmdHm | undefined;
  onAnswerDeadlineChange: (value: IYmdHm | undefined) => void;
  usePassword: boolean;
  onToggleUsePassword: () => void;
  password: string;
  onPasswordChange: (value: string) => void;
  customizeSymbolSettings: boolean;
  onToggleCustomizeSymbolSettings: () => void;
  answerSymbolList: IList<IAnswerSymbol>;
  onAnswerSymbolListChange: (value: IList<IAnswerSymbol>) => void;
  useNotification: boolean;
  onToggleUseNotification: () => void;
  notificationSettings: INotificationSettings;
  onNotificationSettingsChange: (value: INotificationSettings) => void;
}

export const EventSettings = memoNamed<Props>('EventSettings', (props) => (
  <Root>
    <ParagraphWithSwitch
      title={vt.answerDeadline}
      description={vt.howAnswerDeadlineIsUsed}
      show={props.useAnswerDeadline}
      onToggle={props.onToggleAnswerDeadline}
      elementToToggle={
        <BpDatetimePicker
          ymdhm={props.answerDeadline}
          onYmdHmChange={props.onAnswerDeadlineChange}
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
    {/* <ParagraphWithSwitch
      title={vt.usePassword}
      description={vt.howPasswordIsUsed}
      show={props.usePassword}
      onToggle={props.onToggleUsePassword}
      elementToToggle={
        <WidthRestrictedInputWrapper>
          <BpPasswordInput
            password={props.password}
            onPasswordChange={props.onPasswordChange}
            disabled={!props.usePassword}
          />
        </WidthRestrictedInputWrapper>
      }
    /> */}
  </Root>
));

const Root = styled.div`
  padding: 10px;

  & > * {
    margin-bottom: 15px;
  }
`;
