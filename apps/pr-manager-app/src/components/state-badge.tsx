import * as React from 'react';

type Props = Readonly<{ isDraft: boolean }>;

/**
 * Open or draft.
 *
 * Always shown, both ways round. A badge that appears only on a draft makes
 * "open" the absence of something, and the absence of a badge is also what a
 * page that failed to render one looks like.
 *
 * Deliberately not one of the four reserved status colours: a draft is not a
 * warning and an open pull request is not a success, and spending a status
 * colour here would put it on the same row as the check verdict, which is a
 * status.
 */
export const StateBadge = React.memo<Props>(({ isDraft }) => (
  <span className={'badge'} data-state={isDraft ? 'draft' : 'open'}>
    <span aria-hidden={'true'}>{isDraft ? '◌' : '●'}</span>
    {isDraft ? 'draft' : 'open'}
  </span>
));

StateBadge.displayName = 'StateBadge';
