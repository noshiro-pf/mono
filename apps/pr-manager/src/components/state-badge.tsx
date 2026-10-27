import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';

type Props = Readonly<{ isDraft: Bindable<boolean> }>;

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
export const StateBadge = ({ isDraft }: Props): JSX.Element => {
  const state = mapBindable(isDraft, (draft) => (draft ? 'draft' : 'open'));

  return (
    <span class={constant('badge')} data-state={state}>
      <span aria-hidden={constant('true')}>
        {mapBindable(isDraft, (draft) => (draft ? '◌' : '●'))}
      </span>
      {state}
    </span>
  );
};
