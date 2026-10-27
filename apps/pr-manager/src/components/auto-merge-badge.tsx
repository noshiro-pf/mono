import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';

type Props = Readonly<{ armed: Bindable<boolean> }>;

/**
 * Whether anything will land the pull request once the checks go green.
 *
 * Both states. The label is the request and auto-merge is the mechanism:
 * `unblock-prs` arms a pull request labelled `merge-queued` when it picks it,
 * so off is where every queued pull request waits for its turn, and on is its
 * turn having come — or a bot that armed its own.
 */
export const AutoMergeBadge = ({ armed }: Props): JSX.Element => (
  <span
    class={constant('badge')}
    data-auto-merge={mapBindable(armed, (on) => (on ? 'on' : 'off'))}
  >
    <span aria-hidden={constant('true')}>
      {mapBindable(armed, (on) => (on ? '⇥' : '⊘'))}
    </span>
    {mapBindable(armed, (on) => (on ? 'auto-merge on' : 'auto-merge off'))}
  </span>
);
