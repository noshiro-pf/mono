import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { errorFontColor } from '../../constants/color';
import { texts } from '../../constants/texts';
import { EventScheduleValidation } from '../../types/record/event-schedule-validation';
import { Description } from '../atoms/description';

const vt = texts.eventSettingsPage;

interface Props {
  eventScheduleValidation: EventScheduleValidation;
}

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
