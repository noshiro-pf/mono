import { memoNamed } from '@mono/react-utils';
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
      {errorType === 'others' ? (
        <Description color={errorFontColor} text={vt.eventScheduleOtherError} />
      ) : undefined}
    </ErrorMessageWrapper>
  )
);

const ErrorMessageWrapper = styled.div`
  margin: 20px;
`;
