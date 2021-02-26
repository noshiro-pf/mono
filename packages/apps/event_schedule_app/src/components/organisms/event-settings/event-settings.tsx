import { memoNamed, useTinyObservable } from '@noshiro/react-utils';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { IAnswerSymbol } from '../../../types/record/base/answer-symbol';
import { INotificationSettings } from '../../../types/record/base/notification-settings';
import { IYmdHm } from '../../../types/record/ymd-hm';
import { IList } from '../../../utils/immutable';
import { AnswerDeadlineDatepicker } from '../answer-deadline/answer-deadline';
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
    console.log(notificationSettings.toJS());
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
            <AnswerDeadlineDatepicker
              useAnswerDeadline={useAnswerDeadline}
              answerDeadline={answerDeadline}
              onAnswerDeadlineChange={onAnswerDeadlineChange}
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
              answerDeadline={answerDeadline}
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
