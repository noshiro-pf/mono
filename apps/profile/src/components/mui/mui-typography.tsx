import { constant, type Child, type JSX } from 'synstate-dom';
import * as styles from './mui-typography.module.css';

type Props = Readonly<{
  variant: 'title' | 'subtitle1' | 'body1' | 'body2';
  children: Child;
}>;

/** MUI's `Typography` in the default theme's look, for the four variants used. */
export const MuiTypography = ({ variant, children }: Props): JSX.Element => {
  switch (variant) {
    case 'title':
      return <h5 class={constant(styles.title)}>{children}</h5>;

    case 'subtitle1':
      return <h6 class={constant(styles.subtitle1)}>{children}</h6>;

    case 'body1':
      return <p class={constant(styles.body1)}>{children}</p>;

    case 'body2':
      return <p class={constant(styles.body2)}>{children}</p>;
  }
};
