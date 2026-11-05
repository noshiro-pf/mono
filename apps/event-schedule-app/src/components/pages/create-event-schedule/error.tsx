import { constant, type JSX } from 'synstate-dom';
import { dict, errorFontColor } from '../../../constants/index.mjs';
import { Description } from '../../atoms/index.mjs';
import * as styles from '../page-error.module.css';

const dc = dict.errorMessages;

type Props = Readonly<{ errorType: 'not-found' | 'others' }>;

export const FetchEventScheduleError = ({ errorType }: Props): JSX.Element => (
  <div class={constant(styles.pageError)}>
    {errorType === 'others' ? (
      <Description
        color={errorFontColor}
        text={constant(dc.eventScheduleOtherError)}
      />
    ) : (
      []
    )}
  </div>
);
