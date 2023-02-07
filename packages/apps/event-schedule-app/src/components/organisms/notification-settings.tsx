import { FormGroup } from '@blueprintjs/core';
import { isEmailString } from '@noshiro/ts-utils-additional';
import { type NotificationSettingsWithEmail } from '../../types';
import { now, ymdhmDateDiff } from '../../utils';
import { BpCheckbox, BpInput } from '../bp';
import { WidthRestrictedInputWrapper } from '../styled';

const dc = dict.eventSettingsPage.section3;

type Props = Readonly<{
  notificationSettingsWithEmail: NotificationSettingsWithEmail;
  onNotificationSettingsWithEmailChange: (
    value: NotificationSettingsWithEmail
  ) => void;
  disabled: boolean;
  useAnswerDeadline: boolean;
  answerDeadline: Ymdhm | undefined;
  focusEmailInput$: TinyObservable<undefined>;
}>;

export const NotificationSettingsComponent = memoNamed<Props>(
  'NotificationSettings',
  ({
    notificationSettingsWithEmail,
    onNotificationSettingsWithEmailChange,
    disabled,
    useAnswerDeadline,
    answerDeadline,
    focusEmailInput$,
  }) => {
    const onEmailChange = useCallback(
      (email: string) => {
        onNotificationSettingsWithEmailChange(
          Obj.set(notificationSettingsWithEmail, 'email', email)
        );
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange]
    );

    const onNotifyOnAnswerChangeCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange(
          Obj.set(
            notificationSettingsWithEmail,
            'notifyOnAnswerChange',
            checked
          )
        );
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange]
    );

    const onNotify01daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange(
          Obj.set(
            notificationSettingsWithEmail,
            'notify01daysBeforeAnswerDeadline',
            checked
          )
        );
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange]
    );
    const onNotify03daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange(
          Obj.set(
            notificationSettingsWithEmail,
            'notify03daysBeforeAnswerDeadline',
            checked
          )
        );
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange]
    );
    const onNotify07daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange(
          Obj.set(
            notificationSettingsWithEmail,
            'notify07daysBeforeAnswerDeadline',
            checked
          )
        );
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange]
    );
    const onNotify14daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange(
          Obj.set(
            notificationSettingsWithEmail,
            'notify14daysBeforeAnswerDeadline',
            checked
          )
        );
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange]
    );
    const onNotify28daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange(
          Obj.set(
            notificationSettingsWithEmail,
            'notify28daysBeforeAnswerDeadline',
            checked
          )
        );
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange]
    );

    const disabledDetail = useMemo(
      () => ({
        notify01daysBefore:
          disabled ||
          !useAnswerDeadline ||
          answerDeadline === undefined ||
          ymdhmDateDiff(answerDeadline, now()) <= 1,
        notify03daysBefore:
          disabled ||
          !useAnswerDeadline ||
          answerDeadline === undefined ||
          ymdhmDateDiff(answerDeadline, now()) <= 3,
        notify07daysBefore:
          disabled ||
          !useAnswerDeadline ||
          answerDeadline === undefined ||
          ymdhmDateDiff(answerDeadline, now()) <= 7,
        notify14daysBefore:
          disabled ||
          !useAnswerDeadline ||
          answerDeadline === undefined ||
          ymdhmDateDiff(answerDeadline, now()) <= 14,
        notify28daysBefore:
          disabled ||
          !useAnswerDeadline ||
          answerDeadline === undefined ||
          ymdhmDateDiff(answerDeadline, now()) <= 28,
      }),
      [answerDeadline, disabled, useAnswerDeadline]
    );

    const invalidEmail =
      !disabled && !isEmailString(notificationSettingsWithEmail.email);

    const helperText = invalidEmail ? dict.common.error.invalidEmail : '';

    return (
      <div>
        <WidthRestrictedInputWrapper>
          <FormGroup
            helperText={helperText}
            intent={invalidEmail ? 'danger' : 'primary'}
            label={dc.notification.emailAddress}
          >
            <BpInput
              autoFocus={true}
              disabled={disabled}
              focus$={focusEmailInput$}
              intent={invalidEmail ? 'danger' : 'primary'}
              placeholder={'sample@gmail.com'}
              type='email'
              value={notificationSettingsWithEmail.email}
              onValueChange={onEmailChange}
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <div
          css={css`
            padding: 5px;
          `}
        >
          <div>
            <BpCheckbox
              checked={notificationSettingsWithEmail.notifyOnAnswerChange}
              disabled={disabled}
              label={dc.notification.notifyOnAnswerChange}
              onCheck={onNotifyOnAnswerChangeCheck}
            />
          </div>
          <div>
            <BpCheckbox
              checked={
                notificationSettingsWithEmail.notify01daysBeforeAnswerDeadline
              }
              disabled={disabledDetail.notify01daysBefore}
              label={dc.notification.notify01daysBeforeAnswerDeadline}
              onCheck={onNotify01daysBeforeAnswerDeadlineCheck}
            />
          </div>
          <div>
            <BpCheckbox
              checked={
                notificationSettingsWithEmail.notify03daysBeforeAnswerDeadline
              }
              disabled={disabledDetail.notify03daysBefore}
              label={dc.notification.notify03daysBeforeAnswerDeadline}
              onCheck={onNotify03daysBeforeAnswerDeadlineCheck}
            />
          </div>
          <div>
            <BpCheckbox
              checked={
                notificationSettingsWithEmail.notify07daysBeforeAnswerDeadline
              }
              disabled={disabledDetail.notify07daysBefore}
              label={dc.notification.notify07daysBeforeAnswerDeadline}
              onCheck={onNotify07daysBeforeAnswerDeadlineCheck}
            />
          </div>
          <div>
            <BpCheckbox
              checked={
                notificationSettingsWithEmail.notify14daysBeforeAnswerDeadline
              }
              disabled={disabledDetail.notify14daysBefore}
              label={dc.notification.notify14daysBeforeAnswerDeadline}
              onCheck={onNotify14daysBeforeAnswerDeadlineCheck}
            />
          </div>
          <div>
            <BpCheckbox
              checked={
                notificationSettingsWithEmail.notify28daysBeforeAnswerDeadline
              }
              disabled={disabledDetail.notify28daysBefore}
              label={dc.notification.notify28daysBeforeAnswerDeadline}
              onCheck={onNotify28daysBeforeAnswerDeadlineCheck}
            />
          </div>
        </div>
      </div>
    );
  }
);
