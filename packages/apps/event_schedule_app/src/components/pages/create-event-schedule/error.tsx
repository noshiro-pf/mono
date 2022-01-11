import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict, errorFontColor } from '../../../constants';
import { Description } from '../../atoms';

const dc = dict.errorMessages;

type Props = Readonly<{
  errorType: 'not-found' | 'others';
}>;

export const FetchEventScheduleError = memoNamed<Props>(
  'AnswerPageError',
  ({ errorType }) => (
    <ErrorMessageWrapper>
      {errorType === 'others' ? (
        <Description color={errorFontColor} text={dc.eventScheduleOtherError} />
      ) : undefined}
    </ErrorMessageWrapper>
  )
);

const ErrorMessageWrapper = styled.div`
  margin: 20px;
`;
