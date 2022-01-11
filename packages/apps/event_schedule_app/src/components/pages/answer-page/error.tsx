import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict, errorFontColor } from '../../../constants';
import { Description } from '../../atoms';

const dc = dict.errorMessages;

type Props = DeepReadonly<{
  errorType:
    | { data: 'answersResult'; type: 'not-found' | 'others' }
    | { data: 'eventScheduleResult'; type: 'not-found' | 'others' };
}>;

export const AnswerPageError = memoNamed<Props>(
  'AnswerPageError',
  ({ errorType }) => (
    <ErrorMessageWrapper>
      {errorType.data === 'eventScheduleResult' &&
      errorType.type === 'others' ? (
        <Description color={errorFontColor} text={dc.eventScheduleOtherError} />
      ) : undefined}
      {errorType.data === 'answersResult' && errorType.type === 'others' ? (
        <Description color={errorFontColor} text={dc.answersResultOtherError} />
      ) : undefined}
    </ErrorMessageWrapper>
  )
);

const ErrorMessageWrapper = styled.div`
  margin: 20px;
`;
