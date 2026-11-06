import { type InitializedObservable, map } from 'synstate';
import { type Bindable, constant, type JSX, mapBindable } from 'synstate-dom';
import * as styles from './dice-number.module.css';

type Props = Readonly<{
  value: Bindable<number>;
  opacity: InitializedObservable<number>;
  e2eId: string;
}>;

export const DiceNumber = ({ value, opacity, e2eId }: Props): JSX.Element => (
  <div
    class={constant(styles.diceNumber)}
    data-e2e={constant(e2eId)}
    style={{
      'border-color': opacity.pipe(
        map((alpha) => `rgba(143, 186, 255, ${alpha})`),
      ),
    }}
  >
    {mapBindable(value, (n) => (n < 1 ? 0 : n))}
  </div>
);
