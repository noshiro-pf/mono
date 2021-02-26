import { BpCheckbox, BpEmailInput } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { TinyObservable } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { todayYmdhm } from '../../../constants/today-ymdhm';
import { INotificationSettings } from '../../../types/record/base/notification-settings';
import { IYmdHm } from '../../../types/record/ymd-hm';
import { ymdhmDateDiff } from '../../../utils/ymdhm-date-diff';
import { WidthRestrictedInputWrapper } from '../../styled/width-restricted-input-wrapper';

type Props = Readonly<{
  notificationSettings: INotificationSettings;
  onNotificationSettingsChange: (value: INotificationSettings) => void;
  disabled: boolean;
  useAnswerDeadline: boolean;
  answerDeadline: IYmdHm | undefined;
  focusEmailInput$: TinyObservable<void>;
}>;

const vt = texts.eventSettingsPage.section3;

export const NotificationSettings = memoNamed<Props>(
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
        onNotificationSettingsChange(notificationSettings.set('email', email));
      },
      [notificationSettings, onNotificationSettingsChange]
    );

    const onNotifyOnAnswerChangeCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsChange(
          notificationSettings.set('notifyOnAnswerChange', checked)
        );
      },
      [notificationSettings, onNotificationSettingsChange]
    );

    const onNotify01daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsChange(
          notificationSettings.set('notify01daysBeforeAnswerDeadline', checked)
        );
      },
      [notificationSettings, onNotificationSettingsChange]
    );
    const onNotify03daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsChange(
          notificationSettings.set('notify03daysBeforeAnswerDeadline', checked)
        );
      },
      [notificationSettings, onNotificationSettingsChange]
    );
    const onNotify07daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsChange(
          notificationSettings.set('notify07daysBeforeAnswerDeadline', checked)
        );
      },
      [notificationSettings, onNotificationSettingsChange]
    );
    const onNotify14daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsChange(
          notificationSettings.set('notify14daysBeforeAnswerDeadline', checked)
        );
      },
      [notificationSettings, onNotificationSettingsChange]
    );
    const onNotify28daysBeforeAnswerDeadlineCheck = useCallback(
      (checked: boolean) => {
        onNotificationSettingsChange(
          notificationSettings.set('notify28daysBeforeAnswerDeadline', checked)
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
          ymdhmDateDiff(answerDeadline, todayYmdhm) <= 1,
        notify03daysBefore:
          disabled ||
          !useAnswerDeadline ||
          answerDeadline === undefined ||
          ymdhmDateDiff(answerDeadline, todayYmdhm) <= 3,
        notify07daysBefore:
          disabled ||
          !useAnswerDeadline ||
          answerDeadline === undefined ||
          ymdhmDateDiff(answerDeadline, todayYmdhm) <= 7,
        notify14daysBefore:
          disabled ||
          !useAnswerDeadline ||
          answerDeadline === undefined ||
          ymdhmDateDiff(answerDeadline, todayYmdhm) <= 14,
        notify28daysBefore:
          disabled ||
          !useAnswerDeadline ||
          answerDeadline === undefined ||
          ymdhmDateDiff(answerDeadline, todayYmdhm) <= 28,
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
