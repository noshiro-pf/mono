import { Checkbox, FormGroup, InputGroup } from 'blueprint-synstate';
import type { InitializedObservable } from 'synstate';
import {
  constant,
  deriveBindable,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { dict } from '../../constants/index.mjs';
import type { NotificationSettingsWithEmail } from '../../types/index.mjs';
import { now, ymdhmDateDiff } from '../../utils/index.mjs';
import { WidthRestrictedInputWrapper } from '../styled/index.mjs';
import * as styles from './notification-settings.module.css';

const dc = dict.eventSettingsPage.section3;

type Props = Readonly<{
  notificationSettingsWithEmail: InitializedObservable<NotificationSettingsWithEmail>;
  onNotificationSettingsWithEmailChange: (
    value: NotificationSettingsWithEmail,
  ) => void;
  disabled: Bindable<boolean>;
  useAnswerDeadline: Bindable<boolean>;
  answerDeadline: Bindable<Ymdhm | undefined>;
  /**
   * The signed-in account's verified email, which notifications go to. Shown,
   * not typed: the Firestore rules take no other.
   */
  notificationEmail: Bindable<string | undefined>;
}>;

type Item =
  | 'notify00daysBeforeAnswerDeadline'
  | 'notify01daysBeforeAnswerDeadline'
  | 'notify03daysBeforeAnswerDeadline'
  | 'notify07daysBeforeAnswerDeadline'
  | 'notify14daysBeforeAnswerDeadline'
  | 'notify28daysBeforeAnswerDeadline'
  | 'notifyAfterAnswerDeadline'
  | 'notifyOnAnswerChange';

export const NotificationSettingsComponent = ({
  notificationSettingsWithEmail,
  onNotificationSettingsWithEmailChange,
  disabled,
  useAnswerDeadline,
  answerDeadline,
  notificationEmail,
}: Props): JSX.Element => {
  const settings$ = notificationSettingsWithEmail;

  const update = (patch: Partial<NotificationSettingsWithEmail>): void => {
    onNotificationSettingsWithEmailChange({
      ...Optional.unwrap(settings$.getSnapshot()),
      ...patch,
    });
  };

  /** Off unless the deadline is more than `days` days away. */
  const disabledUnlessDeadlineIsAfter = (days: number): Bindable<boolean> =>
    deriveBindable(
      [disabled, useAnswerDeadline, answerDeadline],
      (d, use, deadline) =>
        d ||
        !use ||
        deadline === undefined ||
        ymdhmDateDiff(deadline, now()) <= days,
    );

  const checkbox = (
    item: Item,
    label: string,
    itemDisabled: Bindable<boolean>,
  ): JSX.Element => (
    <div class={constant(styles.checkboxWrapper)}>
      <Checkbox
        checked={mapBindable(settings$, (s) => s[item])}
        disabled={itemDisabled}
        label={constant(label)}
        onChange={({ currentTarget }) => {
          update({ [item]: currentTarget.checked });
        }}
      />
    </div>
  );

  return (
    <div>
      <WidthRestrictedInputWrapper>
        <FormGroup
          helperText={constant(dc.notification.emailAddressIsAccounts)}
          label={constant(dc.notification.emailAddress)}
          labelFor={notificationEmailInputId}
        >
          <InputGroup
            disabled={disabled}
            id={notificationEmailInputId}
            readOnly={constant(true)}
            type={'email'}
            value={mapBindable(notificationEmail, (email) => email ?? '')}
          />
        </FormGroup>
      </WidthRestrictedInputWrapper>
      <div class={constant(styles.checkboxes)}>
        {checkbox(
          'notifyOnAnswerChange',
          dc.notification.notifyOnAnswerChange,
          disabled,
        )}
        {checkbox(
          'notifyAfterAnswerDeadline',
          dc.notification.notifyAfterAnswerDeadline,
          disabledUnlessDeadlineIsAfter(-1),
        )}
        {checkbox(
          'notify00daysBeforeAnswerDeadline',
          dc.notification.notify00daysBeforeAnswerDeadline,
          disabledUnlessDeadlineIsAfter(0),
        )}
        {checkbox(
          'notify01daysBeforeAnswerDeadline',
          dc.notification.notify01daysBeforeAnswerDeadline,
          disabledUnlessDeadlineIsAfter(1),
        )}
        {checkbox(
          'notify03daysBeforeAnswerDeadline',
          dc.notification.notify03daysBeforeAnswerDeadline,
          disabledUnlessDeadlineIsAfter(3),
        )}
        {checkbox(
          'notify07daysBeforeAnswerDeadline',
          dc.notification.notify07daysBeforeAnswerDeadline,
          disabledUnlessDeadlineIsAfter(7),
        )}
        {checkbox(
          'notify14daysBeforeAnswerDeadline',
          dc.notification.notify14daysBeforeAnswerDeadline,
          disabledUnlessDeadlineIsAfter(14),
        )}
        {checkbox(
          'notify28daysBeforeAnswerDeadline',
          dc.notification.notify28daysBeforeAnswerDeadline,
          disabledUnlessDeadlineIsAfter(28),
        )}
      </div>
    </div>
  );
};

const notificationEmailInputId = 'notification-email';
