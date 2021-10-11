import type {
  NotificationSettings,
  SymbolSettings,
  Ymdhm,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed, useTinyObservable } from '@noshiro/react-utils';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { texts } from '../../constants';
import { AnswerDeadlineDatepicker } from './answer-deadline';
import { NotificationSettingsComponent } from './notification-settings';
import { ParagraphWithSwitch } from './paragraph-with-switch';
import { SymbolSettingsComponent } from './symbol-settings';

const vt = texts.eventSettingsPage.section3;

type Props = Readonly<{
  useAnswerDeadline: boolean;
  onToggleAnswerDeadline: () => void;
  answerDeadline: Ymdhm | undefined;
  onAnswerDeadlineChange: (value: Ymdhm | undefined) => void;
  answerSymbols: SymbolSettings;
  onAnswerSymbolsChange: (value: SymbolSettings) => void;
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
    answerSymbols,
    onAnswerSymbolsChange,
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
          description={vt.howAnswerDeadlineIsUsed}
          disabledInsteadOfHidden={true}
          elementToToggle={
            <AnswerDeadlineDatepicker
              answerDeadline={answerDeadline}
              useAnswerDeadline={useAnswerDeadline}
              onAnswerDeadlineChange={onAnswerDeadlineChange}
            />
          }
          show={useAnswerDeadline}
          title={vt.answerDeadline}
          onToggle={onToggleAnswerDeadline}
        />
        <hr />
        <ParagraphWithSwitch
          disabledInsteadOfHidden={true}
          elementToToggle={
            <NotificationSettingsComponent
              answerDeadline={answerDeadline}
              disabled={!useNotification}
              focusEmailInput$={focusEmailInput$}
              notificationSettings={notificationSettings}
              useAnswerDeadline={useAnswerDeadline}
              onNotificationSettingsChange={onNotificationSettingsChange}
            />
          }
          show={useNotification}
          title={vt.useNotification}
          onToggle={onToggleUseNotificationLocal}
        />
        <hr />
        <SymbolSettingsComponent
          answerSymbols={answerSymbols}
          onAnswerSymbolsChange={onAnswerSymbolsChange}
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
