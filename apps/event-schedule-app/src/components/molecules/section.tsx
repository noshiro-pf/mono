import { Button, Card } from 'blueprint-synstate';
import { constant, type Child, type JSX } from 'synstate-dom';
import { SectionTitle } from '../atoms/index.mjs';
import * as styles from './section.module.css';

type Props = Readonly<{
  sectionTitle?: string;
  onCloseClick?: () => void;
  children: Child;
}>;

/** A card with a title and, given `onCloseClick`, a close button. */
export const Section = ({
  children,
  sectionTitle,
  onCloseClick,
}: Props): JSX.Element => (
  <div class={constant(styles.section)}>
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
