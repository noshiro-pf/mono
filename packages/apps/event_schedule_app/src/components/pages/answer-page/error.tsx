import { memoNamed } from '@noshiro/react-utils';
import type { DeepReadonly } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { errorFontColor, texts } from '../../../constants';
import { Description } from '../../atoms';

const vt = texts.errorMessages;

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
        <Description color={errorFontColor} text={vt.eventScheduleOtherError} />
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
