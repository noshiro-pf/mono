import { FormGroup } from '@blueprintjs/core';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';
import { BpCheckbox, BpInput } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { type Observable as SynstateObservable } from 'synstate';
import { type NotificationSettingsWithEmail } from '../../types/index.mjs';
import { isEmailString } from '../../utils-ported/index.mjs';
import { now, ymdhmDateDiff } from '../../utils/index.mjs';
import { WidthRestrictedInputWrapper } from '../styled/index.mjs';

const dc = dict.eventSettingsPage.section3;

type Props = Readonly<{
  notificationSettingsWithEmail: NotificationSettingsWithEmail;
  onNotificationSettingsWithEmailChange: (
    value: NotificationSettingsWithEmail,
  ) => void;
  disabled: boolean;
  useAnswerDeadline: boolean;
  answerDeadline: Ymdhm | undefined;
  focusEmailInput$: SynstateObservable<undefined>;
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
    const onEmailChange = React.useCallback(
      (email: string) => {
        onNotificationSettingsWithEmailChange({
          ...notificationSettingsWithEmail,
          email,
        });
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange],
    );

    const onNotifyOnAnswerChangeCheck = React.useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange({
          ...notificationSettingsWithEmail,
          notifyOnAnswerChange: checked,
        });
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange],
    );

    const onNotifyAfterAnswerDeadlineCheck = React.useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange({
          ...notificationSettingsWithEmail,
          notifyAfterAnswerDeadline: checked,
        });
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange],
    );

    const onNotify00daysBeforeAnswerDeadlineCheck = React.useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange({
          ...notificationSettingsWithEmail,
          notify00daysBeforeAnswerDeadline: checked,
        });
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange],
    );

    const onNotify01daysBeforeAnswerDeadlineCheck = React.useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange({
          ...notificationSettingsWithEmail,
          notify01daysBeforeAnswerDeadline: checked,
        });
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange],
    );

    const onNotify03daysBeforeAnswerDeadlineCheck = React.useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange({
          ...notificationSettingsWithEmail,
          notify03daysBeforeAnswerDeadline: checked,
        });
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange],
    );

    const onNotify07daysBeforeAnswerDeadlineCheck = React.useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange({
          ...notificationSettingsWithEmail,
          notify07daysBeforeAnswerDeadline: checked,
        });
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange],
    );

    const onNotify14daysBeforeAnswerDeadlineCheck = React.useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange({
          ...notificationSettingsWithEmail,
          notify14daysBeforeAnswerDeadline: checked,
        });
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange],
    );

    const onNotify28daysBeforeAnswerDeadlineCheck = React.useCallback(
      (checked: boolean) => {
        onNotificationSettingsWithEmailChange({
          ...notificationSettingsWithEmail,
          notify28daysBeforeAnswerDeadline: checked,
        });
      },
      [notificationSettingsWithEmail, onNotificationSettingsWithEmailChange],
    );

    const disabledDetail = React.useMemo(
      () => ({
        notifyAfterAnswerDeadline:
          disabled ||
          !useAnswerDeadline ||
          answerDeadline === undefined ||
          ymdhmDateDiff(answerDeadline, now()) <= -1,
        notify00daysBefore:
          disabled ||
          !useAnswerDeadline ||
          answerDeadline === undefined ||
          ymdhmDateDiff(answerDeadline, now()) <= 0,
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
      [answerDeadline, disabled, useAnswerDeadline],
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
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              disabled={disabled}
              focus$={focusEmailInput$}
              intent={invalidEmail ? 'danger' : 'primary'}
              placeholder={'sample@gmail.com'}
              type={'email'}
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
          <CheckboxWrapper>
            <BpCheckbox
              checked={notificationSettingsWithEmail.notifyOnAnswerChange}
              disabled={disabled}
              label={dc.notification.notifyOnAnswerChange}
              onCheck={onNotifyOnAnswerChangeCheck}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={notificationSettingsWithEmail.notifyAfterAnswerDeadline}
              disabled={disabledDetail.notifyAfterAnswerDeadline}
              label={dc.notification.notifyAfterAnswerDeadline}
              onCheck={onNotifyAfterAnswerDeadlineCheck}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={
                notificationSettingsWithEmail.notify00daysBeforeAnswerDeadline
              }
              disabled={disabledDetail.notify00daysBefore}
              label={dc.notification.notify00daysBeforeAnswerDeadline}
              onCheck={onNotify00daysBeforeAnswerDeadlineCheck}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={
                notificationSettingsWithEmail.notify01daysBeforeAnswerDeadline
              }
              disabled={disabledDetail.notify01daysBefore}
              label={dc.notification.notify01daysBeforeAnswerDeadline}
              onCheck={onNotify01daysBeforeAnswerDeadlineCheck}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={
                notificationSettingsWithEmail.notify03daysBeforeAnswerDeadline
              }
              disabled={disabledDetail.notify03daysBefore}
              label={dc.notification.notify03daysBeforeAnswerDeadline}
              onCheck={onNotify03daysBeforeAnswerDeadlineCheck}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={
                notificationSettingsWithEmail.notify07daysBeforeAnswerDeadline
              }
              disabled={disabledDetail.notify07daysBefore}
              label={dc.notification.notify07daysBeforeAnswerDeadline}
              onCheck={onNotify07daysBeforeAnswerDeadlineCheck}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={
                notificationSettingsWithEmail.notify14daysBeforeAnswerDeadline
              }
              disabled={disabledDetail.notify14daysBefore}
              label={dc.notification.notify14daysBeforeAnswerDeadline}
              onCheck={onNotify14daysBeforeAnswerDeadlineCheck}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={
                notificationSettingsWithEmail.notify28daysBeforeAnswerDeadline
              }
              disabled={disabledDetail.notify28daysBefore}
              label={dc.notification.notify28daysBeforeAnswerDeadline}
              onCheck={onNotify28daysBeforeAnswerDeadlineCheck}
            />
          </CheckboxWrapper>
        </div>
      </div>
    );
  },
);

const CheckboxWrapper = styled.div`
  display: flex;
`;
