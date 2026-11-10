import { Checkbox, FormGroup, InputGroup } from 'blueprint-synstate';
import type { InitializedObservable, Observable } from 'synstate';
import {
  constant,
  createAfterUpdate,
  deriveBindable,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { dict } from '../../constants/index.mjs';
import type { NotificationSettingsWithEmail } from '../../types/index.mjs';
import { isEmailString } from '../../utils-ported/index.mjs';
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
  /** Each emission focuses the email input. */
  focusEmailInput$: Observable<unknown>;
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
  focusEmailInput$,
}: Props): JSX.Element => {
  const afterUpdate = createAfterUpdate();

  const settings$ = notificationSettingsWithEmail;

  const update = (patch: Partial<NotificationSettingsWithEmail>): void => {
    onNotificationSettingsWithEmailChange({
      ...settings$.getSnapshot().value,
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

  const invalidEmail$ = deriveBindable(
    [disabled, settings$],
    (d, s) => !d && !isEmailString(s.email),
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
          helperText={mapBindable(invalidEmail$, (invalid) =>
            invalid ? dict.common.error.invalidEmail : '',
          )}
          intent={mapBindable(invalidEmail$, (invalid) =>
            invalid ? 'danger' : 'primary',
          )}
          label={constant(dc.notification.emailAddress)}
        >
          <InputGroup
            // eslint-disable-next-line synstate-dom-a11y/no-autofocus -- recorded, not fixed, when jsx-a11y came to synstate-dom (#3764)
            autoFocus
            disabled={disabled}
            inputRef={(input) => {
              focusEmailInput$.subscribe(() => {
                afterUpdate(() => {
                  input.focus();
                });
              });
            }}
            intent={mapBindable(invalidEmail$, (invalid) =>
              invalid ? 'danger' : 'primary',
            )}
            placeholder={constant('sample@gmail.com')}
            type={'email'}
            value={mapBindable(settings$, (s) => s.email)}
            onInput={({ currentTarget }) => {
              update({ email: currentTarget.value });
            }}
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
