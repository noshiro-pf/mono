import { errorFontColor } from '../../../constants';
import { Description } from '../../atoms';

const dc = dict.errorMessages;

type Props = Readonly<{
  errorType: 'not-found' | 'others';
}>;

export const FetchEventScheduleError = memoNamed<Props>(
  'AnswerPageError',
  ({ errorType }) => (
    <div
      css={css`
        margin: 20px;
      `}
    >
      {errorType === 'others' ? (
        <Description color={errorFontColor} text={dc.eventScheduleOtherError} />
      ) : undefined}
    </div>
  )
);
