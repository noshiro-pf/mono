import { constant, type JSX } from 'synstate-dom';
import type { DeepReadonly } from 'ts-type-forge';
import { dict, errorFontColor } from '../../../constants/index.mjs';
import { Description } from '../../atoms/index.mjs';
import * as styles from '../page-error.module.css';

const dc = dict.errorMessages;

type Props = DeepReadonly<{
  errorType:
    | {
        data: 'eventScheduleResult';
        type: { type: 'not-found' | 'others'; message: string };
      }
    | { data: 'answersResult'; type: { type: 'others'; message: string } };
}>;

export const AnswerPageError = ({ errorType }: Props): JSX.Element => (
  <div class={constant(styles.pageError)}>
    {errorType.data === 'eventScheduleResult' &&
    errorType.type.type === 'others' ? (
      <Description
        color={errorFontColor}
        text={constant(dc.eventScheduleOtherError)}
      />
    ) : (
      []
    )}
    {errorType.data === 'answersResult' ? (
      <Description
        color={errorFontColor}
        text={constant(dc.answersResultOtherError)}
      />
    ) : (
      []
    )}
  </div>
);
