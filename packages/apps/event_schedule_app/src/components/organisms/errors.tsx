import type { EventScheduleValidation } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { errorFontColor, texts } from '../../constants';
import { Description } from '../atoms';

const vt = texts.eventSettingsPage;

type Props = Readonly<{
  eventScheduleValidation: EventScheduleValidation;
}>;

export const EventSchedulePropertiesErrors = memoNamed<Props>(
  'EventSchedulePropertiesErrors',
  ({ eventScheduleValidation }) => (
    <ErrorMessagesWrapper>
      {eventScheduleValidation.title ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.titleIsEmpty}
        />
      )}
      {eventScheduleValidation.datetimeRangeList ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.datetimeIsEmpty}
        />
      )}
      {eventScheduleValidation.answerDeadline ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.answerDeadlineIsEnabledButEmpty}
        />
      )}
      {eventScheduleValidation.notificationEmail ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.invalidEmail}
        />
      )}
      {eventScheduleValidation.notificationItems ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.atLeastOneNotificationCheckRequired}
        />
      )}
      {eventScheduleValidation.answerSymbols ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.answerSymbols}
        />
      )}
    </ErrorMessagesWrapper>
  )
);

const ErrorMessagesWrapper = styled.div`
  margin: 10px;
`;
