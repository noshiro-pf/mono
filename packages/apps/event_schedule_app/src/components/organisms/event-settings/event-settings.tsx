import type {
  AnswerSymbol,
  NotificationSettings,
  Ymdhm,
} from '@noshiro/event-schedule-app-api';
import { memoNamed, useTinyObservable } from '@noshiro/react-utils';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { AnswerDeadlineDatepicker } from '../answer-deadline';
import { NotificationSettingsComponent } from '../notification-settings';
import { SymbolSettings } from '../symbol-settings';
import { ParagraphWithSwitch } from './paragraph-with-switch';

const vt = texts.eventSettingsPage.section3;

type Props = Readonly<{
  useAnswerDeadline: boolean;
  onToggleAnswerDeadline: () => void;
  answerDeadline: Ymdhm | undefined;
  onAnswerDeadlineChange: (value: Ymdhm | undefined) => void;
  customizeSymbolSettings: boolean;
  onToggleCustomizeSymbolSettings: () => void;
  answerSymbolList: readonly AnswerSymbol[];
  onAnswerSymbolListChange: (value: readonly AnswerSymbol[]) => void;
  useNotification: boolean;
  onToggleUseNotification: () => void;
  notificationSettings: NotificationSettings;
  onNotificationSettingsChange: (value: NotificationSettings) => void;
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
    const focusEmailInput$ = useTinyObservable<undefined>();

    const [clickedMoreThanOnce, setClickedMoreThanOnce] =
      useState<boolean>(false);

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
            <NotificationSettingsComponent
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
