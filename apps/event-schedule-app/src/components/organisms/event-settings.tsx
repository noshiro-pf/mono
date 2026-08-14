import { css } from '@emotion/react';
import { useBoolState } from 'better-react-use-state';
import * as React from 'react';
import { memoNamed, useObservable } from 'react-utils';
import { notificationSettingsWithEmailDefaultValue } from '../../constants/index.mjs';
import { type NotificationSettingsWithEmail } from '../../types/index.mjs';
import { AnswerDeadlineDatepicker } from './answer-deadline.js';
import { AnswerIconSettingsComponent } from './icon-settings/index.mjs';
import { NotificationSettingsComponent } from './notification-settings.js';
import { ParagraphWithSwitch } from './paragraph-with-switch.js';

const dc = dict.eventSettingsPage.section3;

type Props = Readonly<{
  useAnswerDeadline: boolean;
  onToggleAnswerDeadline: () => void;
  answerDeadline: Ymdhm | undefined;
  onAnswerDeadlineChange: (value: Ymdhm | undefined) => void;
  answerIcons: AnswerIconSettings;
  onAnswerIconsChange: (value: AnswerIconSettings) => void;
  useNotification: boolean;
  onToggleUseNotification: () => void;
  notificationSettingsWithEmail: NotificationSettingsWithEmail | undefined;
  onNotificationSettingsWithEmailChange: (
    value: NotificationSettingsWithEmail,
  ) => void;
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
    notificationSettingsWithEmail,
    onNotificationSettingsWithEmailChange,
  }) => {
    const focusEmailInput$ = useObservable<undefined>();

    const [clickedMoreThanOnce, { setTrue: setClickedMoreThanOnce }] =
      useBoolState(false);

    const onToggleUseNotificationLocal = React.useCallback(() => {
      onToggleUseNotification();

      setClickedMoreThanOnce();
    }, [onToggleUseNotification, setClickedMoreThanOnce]);

    React.useEffect(() => {
      if (useNotification && clickedMoreThanOnce) {
        focusEmailInput$.next(undefined);
      }
    }, [useNotification, focusEmailInput$, clickedMoreThanOnce]);

    const answerDeadlineDatepicker = React.useMemo(
      () => (
        <AnswerDeadlineDatepicker
          answerDeadline={answerDeadline}
          useAnswerDeadline={useAnswerDeadline}
          onAnswerDeadlineChange={onAnswerDeadlineChange}
        />
      ),
      [answerDeadline, onAnswerDeadlineChange, useAnswerDeadline],
    );

    const notificationSettingsComponent = React.useMemo(
      () => (
        <NotificationSettingsComponent
          answerDeadline={answerDeadline}
          disabled={!useNotification}
          focusEmailInput$={focusEmailInput$}
          notificationSettingsWithEmail={
            notificationSettingsWithEmail ??
            notificationSettingsWithEmailDefaultValue
          }
          useAnswerDeadline={useAnswerDeadline}
          onNotificationSettingsWithEmailChange={
            onNotificationSettingsWithEmailChange
          }
        />
      ),
      [
        answerDeadline,
        focusEmailInput$,
        notificationSettingsWithEmail,
        onNotificationSettingsWithEmailChange,
        useAnswerDeadline,
        useNotification,
      ],
    );

    return (
      <div
        css={css`
          padding: 10px;
          & > * {
            margin-bottom: 15px;
          }
        `}
      >
        <ParagraphWithSwitch
          description={dc.answerDeadline.howAnswerDeadlineIsUsed}
          elementToToggle={answerDeadlineDatepicker}
          hideContentIfToggleIsFalse={false}
          title={dc.answerDeadline.title}
          toggleState={useAnswerDeadline}
          onToggle={onToggleAnswerDeadline}
        />
        <hr />
        <ParagraphWithSwitch
          description={dc.notification.description}
          elementToToggle={notificationSettingsComponent}
          hideContentIfToggleIsFalse={false}
          title={dc.notification.useNotification}
          toggleState={useNotification}
          onToggle={onToggleUseNotificationLocal}
        />
        <hr />
        <AnswerIconSettingsComponent
          answerIcons={answerIcons}
          onAnswerIconsChange={onAnswerIconsChange}
        />
      </div>
    );
  },
);
