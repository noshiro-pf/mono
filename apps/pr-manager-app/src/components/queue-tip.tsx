import { memoNamed } from 'preact-utils';

type Props = Readonly<{
  number: number;
  title: string;
  /** What the word under the number leaves out, if anything. */
  detail: string | undefined;
  /**
   * Which end of the row it is drawn from: the start for a box in the first
   * half, the end for one in the second.
   */
  side: 'start' | 'end';
}>;

/**
 * The tooltip of the queue box pointed at or focused (`queue-section.tsx`):
 * the title, and the detail on a second line. One for the whole block,
 * under the row and never wider than it, rather than one per box, which a
 * box would cut off at the edge of a block that scrolls on its own. Hidden
 * from a screen reader, which reads the same words in the box itself.
 */
export const QueueTip = memoNamed<Props>(
  'QueueTip',
  ({ number, title, detail, side }) => (
    <span aria-hidden={'true'} className={'queue-tip'} data-side={side}>
      <span className={'queue-tip-number'}>{`#${number} `}</span>
      {title}
      {detail === undefined ? undefined : (
        <span className={'queue-tip-detail'}>{detail}</span>
      )}
    </span>
  ),
);
