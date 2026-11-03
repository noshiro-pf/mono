import { constant, type Child, type JSX } from 'synstate-dom';
import * as styles from './buttons-wrapper.module.css';

type Props = Readonly<{ children: Child; 'data-e2e'?: string }>;

const wrapper =
  (className: string) =>
  ({ children, 'data-e2e': e2e }: Props): JSX.Element => (
    <div
      class={constant(className)}
      {...(e2e === undefined ? {} : { 'data-e2e': constant(e2e) })}
    >
      {children}
    </div>
  );

export const SingleButtonWrapper = wrapper(styles.single);

/** Buttons in a row, 5px apart. */
export const ButtonsWrapperNowrap = wrapper(styles.nowrap);

/** Buttons in a row that wraps, the first row last. */
export const ButtonsWrapper = wrapper(`${styles.nowrap} ${styles.wrap}`);

export const ButtonsWrapperAlignEnd = wrapper(
  `${styles.nowrap} ${styles.wrap} ${styles.alignEnd}`,
);

/** The buttons under the create and edit pages' settings. */
export const ButtonsWrapperForEventSettingsPage = wrapper(
  `${styles.nowrap} ${styles.wrap} ${styles.alignEnd} ${styles.eventSettingsPage}`,
);
