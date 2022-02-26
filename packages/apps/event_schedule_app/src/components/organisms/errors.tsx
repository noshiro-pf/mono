import type { EventScheduleValidation } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict, errorFontColor } from '../../constants';
import { Description } from '../atoms';

const dc = dict.eventSettingsPage;

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
          text={dc.errorMessages.titleIsEmpty}
        />
      )}
      {eventScheduleValidation.datetimeRangeList ? undefined : (
        <Description
          color={errorFontColor}
          text={dc.errorMessages.datetimeIsEmpty}
        />
      )}
      {eventScheduleValidation.notificationEmail ? undefined : (
        <Description
          color={errorFontColor}
          text={dict.common.error.invalidEmail}
        />
      )}
      {eventScheduleValidation.notificationItems ? undefined : (
        <Description
          color={errorFontColor}
          text={dc.errorMessages.atLeastOneNotificationCheckRequired}
        />
      )}
      {eventScheduleValidation.answerIcons ? undefined : (
        <Description
          color={errorFontColor}
          text={dc.errorMessages.answerIcons}
        />
      )}
    </ErrorMessagesWrapper>
  )
);

const ErrorMessagesWrapper = styled.div`
  margin: 10px;
`;
