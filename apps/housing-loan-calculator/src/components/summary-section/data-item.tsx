import { constant, type Bindable, type JSX } from 'synstate-dom';
import * as styles from './data-item.module.css';

type Props = Readonly<{
  title: Bindable<string>;
  description: Bindable<string>;
  'data-e2e-title': string;
  'data-e2e-description': string;
}>;

export const DataItem = ({
  title,
  description,
  'data-e2e-title': e2eTitle,
  'data-e2e-description': e2eDescription,
}: Props): JSX.Element => (
  <>
    <dt class={constant(styles.item)} data-e2e={constant(e2eTitle)}>
      {title}
    </dt>
    <dd class={constant(styles.item)} data-e2e={constant(e2eDescription)}>
      {description}
    </dd>
  </>
);
