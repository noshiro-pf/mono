import { memoNamed } from 'preact-utils';
import { useCallback } from 'preact/hooks';
import type { OutsideNode } from '../queue-view.mjs';
import { ExternalLink } from './external-link.js';

type Props = Readonly<{
  node: OutsideNode;
  /** Pointed at or focused: its tooltip is shown (`queue-tip.tsx`). */
  onShow: (prNumber: number) => void;
  onHide: () => void;
}>;

/**
 * One pull request outside the queue (`queue-section.tsx`): its number, why
 * in a word, and whose it is to move.
 */
export const QueueOutsideBox = memoNamed<Props>(
  'QueueOutsideBox',
  ({ node, onShow, onHide }) => {
    const show = useCallback((): void => {
      onShow(node.number);
    }, [onShow, node.number]);

    return (
      <ExternalLink
        href={node.url}
        variant={'queue-link'}
        onEnter={show}
        onLeave={onHide}
      >
        <span className={'queue-number'}>{`#${node.number}`}</span>
        <span className={'queue-note'}>{`${node.reason} · ${node.owner}`}</span>

        <span className={'visually-hidden'}>
          {` ${node.title} — ${node.detail}`}
        </span>
      </ExternalLink>
    );
  },
);
