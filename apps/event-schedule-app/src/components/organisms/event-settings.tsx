import { map, type InitializedObservable } from 'synstate';
import {
  constant,
  deriveBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import {
  dict,
  notificationSettingsWithEmailDefaultValue,
} from '../../constants/index.mjs';
import type { NotificationSettingsWithEmail } from '../../types/index.mjs';
import { AnswerDeadlineDatepicker } from './answer-deadline.js';
import * as styles from './event-settings.module.css';
import { AnswerIconSettingsComponent } from './icon-settings/index.mjs';
import { NotificationSettingsComponent } from './notification-settings.js';
import { ParagraphWithSwitch } from './paragraph-with-switch.js';

const dc = dict.eventSettingsPage.section3;

type Props = Readonly<{
  useAnswerDeadline: InitializedObservable<boolean>;
  onToggleAnswerDeadline: () => void;
  answerDeadline: Bindable<Ymdhm | undefined>;
  onAnswerDeadlineChange: (value: Ymdhm | undefined) => void;
  answerIcons: Bindable<AnswerIconSettings>;
  onAnswerIconsChange: (value: AnswerIconSettings) => void;
  useNotification: InitializedObservable<boolean>;
  onToggleUseNotification: () => void;
  notificationSettingsWithEmail: InitializedObservable<
    NotificationSettingsWithEmail | undefined
  >;
  onNotificationSettingsWithEmailChange: (
    value: NotificationSettingsWithEmail,
  ) => void;
  /** The signed-in account's verified email; notifications need one. */
  notificationEmail: InitializedObservable<string | undefined>;
}>;

export const EventSettings = ({
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
  notificationEmail,
}: Props): JSX.Element => {
  const notificationDescription = notificationEmail.pipe(
    map((email) =>
      email === undefined
        ? Arr.toPushed(
            dc.notification.description,
            dc.notification.requiresVerifiedAccount,
          )
        : dc.notification.description,
    ),
  );

  // Off and with no verified email, notifications cannot be turned on. On, as
  // an event saved before may be, they can always be turned off.
  const notificationToggleDisabled = deriveBindable(
    [notificationEmail, useNotification],
    (email, use) => email === undefined && !use,
  );

  return (
    <div class={constant(styles.settings)}>
      <ParagraphWithSwitch
        description={dc.answerDeadline.howAnswerDeadlineIsUsed}
        elementToToggle={
          <AnswerDeadlineDatepicker
            answerDeadline={answerDeadline}
            useAnswerDeadline={useAnswerDeadline}
            onAnswerDeadlineChange={onAnswerDeadlineChange}
          />
        }
        title={dc.answerDeadline.title}
        toggleState={useAnswerDeadline}
        onToggle={onToggleAnswerDeadline}
      />
      <hr />
      <ParagraphWithSwitch
        description={notificationDescription}
        elementToToggle={
          <NotificationSettingsComponent
            answerDeadline={answerDeadline}
            disabled={useNotification.pipe(map((use) => !use))}
            notificationEmail={notificationEmail}
            notificationSettingsWithEmail={notificationSettingsWithEmail.pipe(
              map(
                (settings) =>
                  settings ?? notificationSettingsWithEmailDefaultValue,
              ),
            )}
            useAnswerDeadline={useAnswerDeadline}
            onNotificationSettingsWithEmailChange={
              onNotificationSettingsWithEmailChange
            }
          />
        }
        title={dc.notification.useNotification}
        toggleDisabled={notificationToggleDisabled}
        toggleState={useNotification}
        onToggle={onToggleUseNotification}
      />
      <hr />
      <AnswerIconSettingsComponent
        answerIcons={answerIcons}
        onAnswerIconsChange={onAnswerIconsChange}
      />
    </div>
  );
};
