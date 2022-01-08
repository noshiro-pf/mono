import type {
  AnswerIconSettings,
  NotificationSettings,
  Ymdhm,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed, useTinyObservable } from '@noshiro/react-utils';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { dict } from '../../constants';
import { AnswerDeadlineDatepicker } from './answer-deadline';
import { AnswerIconSettingsComponent } from './icon-settings';
import { NotificationSettingsComponent } from './notification-settings';
import { ParagraphWithSwitch } from './paragraph-with-switch';

const vt = dict.eventSettingsPage.section3;

type Props = Readonly<{
  useAnswerDeadline: boolean;
  onToggleAnswerDeadline: () => void;
  answerDeadline: Ymdhm | undefined;
  onAnswerDeadlineChange: (value: Ymdhm | undefined) => void;
  answerIcons: AnswerIconSettings;
  onAnswerIconsChange: (value: AnswerIconSettings) => void;
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
    answerIcons,
    onAnswerIconsChange,
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
          description={vt.answerDeadline.howAnswerDeadlineIsUsed}
          disabledInsteadOfHidden={true}
          elementToToggle={
            <AnswerDeadlineDatepicker
              answerDeadline={answerDeadline}
              useAnswerDeadline={useAnswerDeadline}
              onAnswerDeadlineChange={onAnswerDeadlineChange}
            />
          }
          show={useAnswerDeadline}
          title={vt.answerDeadline.title}
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
          title={vt.notification.useNotification}
          onToggle={onToggleUseNotificationLocal}
        />
        <hr />
        <AnswerIconSettingsComponent
          answerIcons={answerIcons}
          onAnswerIconsChange={onAnswerIconsChange}
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
