import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { errorFontColor } from '../../constants/color';
import { texts } from '../../constants/texts';
import { Description } from '../atoms/description';

const vt = texts.createEventPage;

interface Props {
  requiredElementsOk: {
    title: boolean;
    datetimeRangeList: boolean;
    answerDeadline: boolean;
    password: boolean;
    answerSymbolList: boolean;
  };
}

export const CreateEventSchedulePageErrors = memoNamed<Props>(
  'CreateEventSchedulePageErrors',
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
    </ErrorMessagesWrapper>
  )
);

const ErrorMessagesWrapper = styled.div`
  margin: 10px;
`;
