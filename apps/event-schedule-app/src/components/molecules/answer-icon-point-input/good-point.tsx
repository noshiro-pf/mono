import { constant, type JSX } from 'synstate-dom';
import { defaultIconPoint } from '../../../constants/index.mjs';
import * as styles from './fixed-point.module.css';

export const AnswerIconGoodPoint = (): JSX.Element => (
  <div class={constant(styles.point)}>
    {constant(defaultIconPoint.good.toString())}
  </div>
);
