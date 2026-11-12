import { Button, Card } from 'blueprint-synstate';
import {
  constant,
  mapBindable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { SectionTitle } from '../atoms/index.mjs';
import * as styles from './section.module.css';

type Props = Readonly<{
  sectionTitle?: string;
  onCloseClick?: () => void;
  /** Classes for the wrapper round the card, after its own. */
  class?: Bindable<string>;
  children: Child;
}>;

/** A card with a title and, given `onCloseClick`, a close button. */
export const Section = ({
  children,
  sectionTitle,
  onCloseClick,
  class: className,
}: Props): JSX.Element => (
  <div
    class={
      className === undefined
        ? constant(styles.section)
        : mapBindable(className, (c) =>
            c === '' ? styles.section : `${styles.section} ${c}`,
          )
    }
  >
    <Card elevation={1}>
      <div class={constant(styles.header)}>
        {sectionTitle === undefined ? (
          []
        ) : (
          <SectionTitle>{constant(sectionTitle)}</SectionTitle>
        )}
        {onCloseClick === undefined ? (
          []
        ) : (
          <Button
            icon={'cross'}
            variant={constant('minimal')}
            onClick={onCloseClick}
          />
        )}
      </div>
      {children}
    </Card>
  </div>
);
