import { constant, type JSX } from 'synstate-dom';
import * as styles from './list-item-with-avatar.module.css';

type Props = Readonly<{
  alt: string;
  src: string;
  children: JSX.Element;
}>;

/**
 * MUI's `ListItem` holding a `ListItemAvatar` with an image `Avatar` and a
 * `ListItemText`, in the default theme's look.
 */
export const ListItemWithAvatar = ({
  alt,
  src,
  children,
}: Props): JSX.Element => (
  <li class={constant(styles.item)}>
    <div class={constant(styles.itemAvatar)}>
      <div class={constant(styles.avatar)}>
        <img
          alt={constant(alt)}
          class={constant(styles.avatarImage)}
          src={constant(src)}
        />
      </div>
    </div>
    <div class={constant(styles.itemText)}>{children}</div>
  </li>
);
