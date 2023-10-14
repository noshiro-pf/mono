import { errorFontColor } from '../../../constants';
import { Description } from '../../atoms';

const dc = dict.errorMessages;

type Props = DeepReadonly<{
  errorType:
    | {
        data: 'eventScheduleResult';
        type: { type: 'not-found' | 'others'; message: string };
      }
    | { data: 'answersResult'; type: { type: 'others'; message: string } };
}>;

export const AnswerPageError = memoNamed<Props>(
  'AnswerPageError',
  ({ errorType }) => (
    <div
      css={css`
        margin: 20px;
      `}
    >
      {errorType.data === 'eventScheduleResult' &&
      errorType.type.type === 'others' ? (
        <Description color={errorFontColor} text={dc.eventScheduleOtherError} />
      ) : undefined}
      {errorType.data === 'answersResult' ? (
        <Description color={errorFontColor} text={dc.answersResultOtherError} />
      ) : undefined}
    </div>
  ),
);
