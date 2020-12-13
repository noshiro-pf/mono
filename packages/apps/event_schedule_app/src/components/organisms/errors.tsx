import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { errorFontColor } from '../../constants/color';
import { texts } from '../../constants/texts';
import { RequiredElementsOk } from '../../types/record/required-elements-ok';
import { Description } from '../atoms/description';

const vt = texts.createEventPage;

interface Props {
  requiredElementsOk: RequiredElementsOk;
}

export const EventSchedulePropertiesErrors = memoNamed<Props>(
  'EventSchedulePropertiesErrors',
  (props) => (
    <ErrorMessagesWrapper>
      {props.requiredElementsOk.title ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.titleIsEmpty}
        />
      )}
      {props.requiredElementsOk.datetimeRangeList ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.datetimeIsEmpty}
        />
      )}
      {props.requiredElementsOk.answerDeadline ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.answerDeadlineIsEnabledButEmpty}
        />
      )}
      {props.requiredElementsOk.password ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.passwordIsEnabledButEmpty}
        />
      )}
      {props.requiredElementsOk.answerSymbolList ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.atLeastTwoSymbolsRequired}
        />
      )}
      {props.requiredElementsOk.notificationEmail ? undefined : (
        <Description
          color={errorFontColor}
          text={vt.errorMessages.invalidEmail}
        />
      )}
      {props.requiredElementsOk.notificationItems ? undefined : (
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
