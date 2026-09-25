import * as React from 'react';

type Props = Readonly<{ armed: boolean }>;

/**
 * Whether anything will land the pull request once the checks go green.
 *
 * Both states. The label is the request and auto-merge is the mechanism:
 * `unblock-prs` arms a pull request labelled `merge-queued` when it picks it,
 * so off is where every queued pull request waits for its turn, and on is its
 * turn having come — or a bot that armed its own.
 */
export const AutoMergeBadge = React.memo<Props>(({ armed }) => (
  <span className={'badge'} data-auto-merge={armed ? 'on' : 'off'}>
    <span aria-hidden={'true'}>{armed ? '⇥' : '⊘'}</span>
    {armed ? 'auto-merge on' : 'auto-merge off'}
  </span>
));

AutoMergeBadge.displayName = 'AutoMergeBadge';
