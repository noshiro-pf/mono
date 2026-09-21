import * as React from 'react';

type Props = Readonly<{ armed: boolean }>;

/**
 * Whether anything will land the pull request once the checks go green.
 *
 * Both states, because off is the state worth seeing. The label is the
 * request and auto-merge is the mechanism, and the two come apart: a pull
 * request labelled `merge-queued` with nothing armed to land it is the
 * combination `unblock-prs` passes over with "auto-merge is not enabled", and
 * until this page existed the only place that was visible was that script's
 * own output.
 */
export const AutoMergeBadge = React.memo<Props>(({ armed }) => (
  <span className={'badge'} data-auto-merge={armed ? 'on' : 'off'}>
    <span aria-hidden={'true'}>{armed ? '⇥' : '⊘'}</span>
    {armed ? 'auto-merge on' : 'auto-merge off'}
  </span>
));

AutoMergeBadge.displayName = 'AutoMergeBadge';
