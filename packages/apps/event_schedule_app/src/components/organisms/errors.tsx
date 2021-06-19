import type { EventScheduleValidation } from '@noshiro/event-schedule-app-api';
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
  (props) => (
    <ErrorMessagesWrapper>
      {props.eventScheduleValidation.title ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.titleIsEmpty}
        />
      )}
      {props.eventScheduleValidation.datetimeRangeList ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.datetimeIsEmpty}
        />
      )}
      {props.eventScheduleValidation.answerDeadline ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.answerDeadlineIsEnabledButEmpty}
        />
      )}
      {props.eventScheduleValidation.answerSymbolList ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.atLeastTwoSymbolsRequired}
        />
      )}
      {props.eventScheduleValidation.notificationEmail ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.invalidEmail}
        />
      )}
      {props.eventScheduleValidation.notificationItems ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.atLeastOneNotificationCheckRequired}
        />
      )}
    </ErrorMessagesWrapper>
  )
);

const ErrorMessagesWrapper = styled.div`
  margin: 10px;
`;
