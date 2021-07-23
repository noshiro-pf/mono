import type {
  NotificationSettings,
  Ymdhm,
} from '@noshiro/event-schedule-app-shared';
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
            disabled={disabled}
            focus$={focusEmailInput$}
            formGroupLabel={vt.emailAddress}
            invalidMessage={texts.eventSettingsPage.errorMessages.invalidEmail}
            value={notificationSettings.email}
            onValueChange={onEmailChange}
          />
        </WidthRestrictedInputWrapper>
        <CheckboxesWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={notificationSettings.notifyOnAnswerChange}
              disabled={disabled}
              label={vt.notifyOnAnswerChange}
              onCheck={onNotifyOnAnswerChangeCheck}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={notificationSettings.notify01daysBeforeAnswerDeadline}
              disabled={disabledDetail.notify01daysBefore}
              label={vt.notify01daysBeforeAnswerDeadline}
              onCheck={onNotify01daysBeforeAnswerDeadlineCheck}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={notificationSettings.notify03daysBeforeAnswerDeadline}
              disabled={disabledDetail.notify03daysBefore}
              label={vt.notify03daysBeforeAnswerDeadline}
              onCheck={onNotify03daysBeforeAnswerDeadlineCheck}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={notificationSettings.notify07daysBeforeAnswerDeadline}
              disabled={disabledDetail.notify07daysBefore}
              label={vt.notify07daysBeforeAnswerDeadline}
              onCheck={onNotify07daysBeforeAnswerDeadlineCheck}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={notificationSettings.notify14daysBeforeAnswerDeadline}
              disabled={disabledDetail.notify14daysBefore}
              label={vt.notify14daysBeforeAnswerDeadline}
              onCheck={onNotify14daysBeforeAnswerDeadlineCheck}
            />
          </CheckboxWrapper>
          <CheckboxWrapper>
            <BpCheckbox
              checked={notificationSettings.notify28daysBeforeAnswerDeadline}
              disabled={disabledDetail.notify28daysBefore}
              label={vt.notify28daysBeforeAnswerDeadline}
              onCheck={onNotify28daysBeforeAnswerDeadlineCheck}
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
