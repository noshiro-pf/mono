import { createEventEmitter, map, type InitializedObservable } from 'synstate';
import {
  constant,
  createAfterUpdate,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
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
}: Props): JSX.Element => {
  const [focusEmailInput$, focusEmailInput] = createEventEmitter();

  const afterUpdate = createAfterUpdate();

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
        description={dc.notification.description}
        elementToToggle={
          <NotificationSettingsComponent
            answerDeadline={answerDeadline}
            disabled={view(useNotification, (use) => !use)}
            focusEmailInput$={focusEmailInput$}
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
        toggleState={useNotification}
        onToggle={() => {
          onToggleUseNotification();

          // The email input is wanted next once notifications are turned on.
          afterUpdate(() => {
            if (useNotification.getSnapshot().value) {
              focusEmailInput();
            }
          });
        }}
      />
      <hr />
      <AnswerIconSettingsComponent
        answerIcons={answerIcons}
        onAnswerIconsChange={onAnswerIconsChange}
      />
    </div>
  );
};
