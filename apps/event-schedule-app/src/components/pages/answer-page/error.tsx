import { css } from '@emotion/react';
import { memoNamed } from 'react-utils';
import { type DeepReadonly } from 'ts-type-forge';
import { errorFontColor } from '../../../constants/index.mjs';
import { Description } from '../../atoms/index.mjs';

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
