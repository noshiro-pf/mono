import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { errorFontColor } from '../../../constants/color';
import { texts } from '../../../constants/texts';
import { Description } from '../../atoms/description';

const vt = texts.errorMessages;

interface Props {
  errorType: 'not-found' | 'others';
}

export const FetchEventScheduleError = memoNamed<Props>(
  'AnswerPageError',
  ({ errorType }) => (
    <ErrorMessageWrapper>
      {errorType === 'not-found' ? (
        <Description color={errorFontColor} text={vt.eventScheduleNotFound} />
      ) : undefined}
      {errorType === 'others' ? (
        <Description color={errorFontColor} text={vt.eventScheduleOtherError} />
      ) : undefined}
    </ErrorMessageWrapper>
  )
);

const ErrorMessageWrapper = styled.div`
  margin: 20px;
`;
