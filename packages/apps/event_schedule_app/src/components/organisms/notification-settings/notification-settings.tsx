import type {
  NotificationSettings,
  Ymdhm,
} from '@noshiro/event-schedule-app-api';
import { BpCheckbox, BpEmailInput } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { TinyObservable } from '@noshiro/ts-utils';
import { IRecord } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { now, ymdhmDateDiff } from '../../../functions';
import { WidthRestrictedInputWrapper } from '../../styled';

type Props = Readonly<{
  notificationSettings: NotificationSettings;
  onNotificationSettingsChange: (value: NotificationSettings) => void;
  disabled: boolean;
  useAnswerDeadline: boolean;
  answerDeadline: Ymdhm | undefined;
  focusEmailInput$: TinyObservable<undefined>;
}>;

const vt = texts.eventSettingsPage.section3;

export const NotificationSettingsComponent = memoNamed<Props>(
  'NotificationSettings',
  ({
    notificationSettings,
    onNotificationSettingsChange,
    disabled,
    useAnswerDeadline,
    answerDeadline,
    focusEmailInput$,
  }) => {
    const onEmailChange = useCallback(
      (email: string) => {
        onNotificationSettingsChange(
          IRecord.set(notificationSettings, 'email', email)
        );
      },
      [notificationSettings, onNotificationSettingsChange]
    );

    const onNotifyOnAnswerChangeCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsChange(
          IRecord.set(notificationSettings, 'notifyOnAnswerChange', checked)
        );
      },
      [notificationSettings, onNotificationSettingsChange]
    );

    const onNotify01daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsChange(
          IRecord.set(
            notificationSettings,
            'notify01daysBeforeAnswerDeadline',
            checked
          )
        );
      },
      [notificationSettings, onNotificationSettingsChange]
    );
    const onNotify03daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsChange(
          IRecord.set(
            notificationSettings,
            'notify03daysBeforeAnswerDeadline',
            checked
          )
        );
      },
      [notificationSettings, onNotificationSettingsChange]
    );
    const onNotify07daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsChange(
          IRecord.set(
            notificationSettings,
            'notify07daysBeforeAnswerDeadline',
            checked
          )
        );
      },
      [notificationSettings, onNotificationSettingsChange]
    );
    const onNotify14daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsChange(
          IRecord.set(
            notificationSettings,
            'notify14daysBeforeAnswerDeadline',
            checked
          )
        );
      },
      [notificationSettings, onNotificationSettingsChange]
    );
    const onNotify28daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsChange(
          IRecord.set(
            notificationSettings,
            'notify28daysBeforeAnswerDeadline',
            checked
          )
        );
      },
      [notificationSettings, onNotificationSettingsChange]
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

    return (
      <div>
        <WidthRestrictedInputWrapper>
          <BpEmailInput
            focus$={focusEmailInput$}
            formGroupLabel={vt.emailAddress}
            value={notificationSettings.email}
            onValueChange={onEmailChange}
            disabled={disabled}
            invalidMessage={texts.eventSettingsPage.errorMessages.invalidEmail}
          />
        </WidthRestrictedInputWrapper>
        <CheckboxesWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              label={vt.notifyOnAnswerChange}
              checked={notificationSettings.notifyOnAnswerChange}
              onCheck={onNotifyOnAnswerChangeCheck}
              disabled={disabled}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              label={vt.notify01daysBeforeAnswerDeadline}
              checked={notificationSettings.notify01daysBeforeAnswerDeadline}
              onCheck={onNotify01daysBeforeAnswerDeadlineCheck}
              disabled={disabledDetail.notify01daysBefore}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              label={vt.notify03daysBeforeAnswerDeadline}
              checked={notificationSettings.notify03daysBeforeAnswerDeadline}
              onCheck={onNotify03daysBeforeAnswerDeadlineCheck}
              disabled={disabledDetail.notify03daysBefore}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              label={vt.notify07daysBeforeAnswerDeadline}
              checked={notificationSettings.notify07daysBeforeAnswerDeadline}
              onCheck={onNotify07daysBeforeAnswerDeadlineCheck}
              disabled={disabledDetail.notify07daysBefore}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              label={vt.notify14daysBeforeAnswerDeadline}
              checked={notificationSettings.notify14daysBeforeAnswerDeadline}
              onCheck={onNotify14daysBeforeAnswerDeadlineCheck}
              disabled={disabledDetail.notify14daysBefore}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              label={vt.notify28daysBeforeAnswerDeadline}
              checked={notificationSettings.notify28daysBeforeAnswerDeadline}
              onCheck={onNotify28daysBeforeAnswerDeadlineCheck}
              disabled={disabledDetail.notify28daysBefore}
            />
          </CheckboxWrapper>
        </CheckboxesWrapper>
      </div>
    );
  }
);

const CheckboxesWrapper = styled.div`
  padding: 5px;
`;

const CheckboxWrapper = styled.div`
  display: flex;
`;
