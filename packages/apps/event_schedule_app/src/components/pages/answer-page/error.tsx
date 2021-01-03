import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { errorFontColor } from '../../../constants/color';
import { texts } from '../../../constants/texts';
import { Description } from '../../atoms/description';

const vt = texts.errorMessages;

interface Props {
  errorType:
    | { data: 'eventScheduleResult'; type: 'not-found' | 'others' }
    | { data: 'answersResult'; type: 'not-found' | 'others' };
}

export const AnswerPageError = memoNamed<Props>(
  'AnswerPageError',
  ({ errorType }) => (
    <ErrorMessageWrapper>
      {errorType.data === 'eventScheduleResult' &&
      errorType.type === 'not-found' ? (
        <Description color={errorFontColor} text={vt.eventScheduleNotFound} />
      ) : undefined}
      {errorType.data === 'eventScheduleResult' &&
      errorType.type === 'others' ? (
        <Description color={errorFontColor} text={vt.eventScheduleOtherError} />
      ) : undefined}
      {errorType.data === 'answersResult' && errorType.type === 'not-found' ? (
        <Description color={errorFontColor} text={vt.answersResultNotFound} />
      ) : undefined}
      {errorType.data === 'answersResult' && errorType.type === 'others' ? (
        <Description color={errorFontColor} text={vt.answersResultOtherError} />
      ) : undefined}
    </ErrorMessageWrapper>
  )
);

const ErrorMessageWrapper = styled.div`
  margin: 20px;
`;
