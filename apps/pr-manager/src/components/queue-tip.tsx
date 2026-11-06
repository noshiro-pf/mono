import { type InitializedObservable, map } from 'synstate';
import { constant, If, inlineMap, type JSX } from 'synstate-dom';

/** What the tooltip shows. */
export type QueueTipContent = Readonly<{
  number: number;
  title: string;
  /** What the word under the number leaves out, if anything. */
  detail: string | undefined;
  /**
   * Which end of the row it is drawn from: the start for a box in the left half
   * of what is in view, the end for one in the right half.
   */
  side: 'start' | 'end';
}>;

type Props = Readonly<{ tip: InitializedObservable<QueueTipContent> }>;

/**
 * The tooltip of the queue box pointed at or focused (`queue-section.tsx`):
 * the title, and the detail on a second line. One for the whole block, under
 * the row and never wider than it, rather than one per box, which a box would
 * cut off at the edge of a block that scrolls on its own. Hidden from a screen
 * reader, which reads the same words in the box itself.
 */
export const QueueTip = ({ tip }: Props): JSX.Element => (
  <span
    aria-hidden={constant('true')}
    class={constant('queue-tip')}
    data-side={inlineMap(tip, ({ side }) => side)}
  >
    <span class={constant('queue-tip-number')}>
      {inlineMap(tip, ({ number }) => `#${number} `)}
    </span>
    {inlineMap(tip, ({ title }) => title)}
    <If
      cond={tip.pipe(map(({ detail }) => detail !== undefined))}
      then={
        <span class={constant('queue-tip-detail')}>
          {inlineMap(tip, ({ detail }) => detail ?? '')}
        </span>
      }
    />
  </span>
);
