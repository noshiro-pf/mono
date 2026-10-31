import type { InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
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
    href={view(node$, (node) => node.url)}
    variant={'queue-link'}
    onEnter={() => {
      onShow(node$.getSnapshot().value.number);
    }}
    onLeave={onHide}
  >
    <span class={constant('queue-number')}>
      {view(node$, (node) => `#${node.number}`)}
    </span>
    <span class={constant('queue-note')}>
      {view(node$, (node) => `${node.reason} · ${node.owner}`)}
    </span>

    <span class={constant('visually-hidden')}>
      {view(node$, (node) => ` ${node.title} — ${node.detail}`)}
    </span>
  </ExternalLink>
);
