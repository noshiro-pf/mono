import { type InitializedObservable, map } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import type { OutsideNode } from '../queue-view.mjs';
import { ExternalLink } from './external-link.js';

type Props = Readonly<{
  node$: InitializedObservable<OutsideNode>;
  /** Pointed at or focused: its tooltip is shown (`queue-tip.tsx`). */
  onShow: (prNumber: number) => void;
  onHide: () => void;
}>;

/**
 * One pull request outside the queue (`queue-section.tsx`): its number, why in
 * a word, and whose it is to move.
 */
export const QueueOutsideBox = ({
  node$,
  onShow,
  onHide,
}: Props): JSX.Element => (
  <ExternalLink
    href={node$.pipe(map((node) => node.url))}
    variant={'queue-link'}
    onEnter={() => {
      onShow(node$.getSnapshot().value.number);
    }}
    onLeave={onHide}
  >
    <span class={constant('queue-number')}>
      {node$.pipe(map((node) => `#${node.number}`))}
    </span>
    <span class={constant('queue-note')}>
      {node$.pipe(map((node) => `${node.reason} · ${node.owner}`))}
    </span>

    <span class={constant('visually-hidden')}>
      {node$.pipe(map((node) => ` ${node.title} — ${node.detail}`))}
    </span>
  </ExternalLink>
);
