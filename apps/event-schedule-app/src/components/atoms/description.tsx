import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import { descriptionFontColor } from '../../constants/index.mjs';
import * as styles from './description.module.css';

type Props = Readonly<{
  text: Bindable<string>;
  error?: Bindable<boolean>;
  /** In place of the normal or error colour. */
  color?: string;
}>;

export const Description = ({ text, error, color }: Props): JSX.Element => (
  <div
    class={constant(styles.description)}
    style={{
      color:
        color === undefined
          ? mapBindable(error ?? constant(false), (e) =>
              e ? descriptionFontColor.error : descriptionFontColor.normal,
            )
          : constant(color),
    }}
  >
    {text}
  </div>
);
