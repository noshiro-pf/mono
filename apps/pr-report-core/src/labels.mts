/**
 * The labels this repository's queue is made of. They exist only on GitHub,
 * so these strings, and the ones in `.github/workflows/`, are the whole of
 * their declaration: `unblock-prs` and `open-pr` act on them, and
 * `pr-report` and the Pull Requests Manager page report them.
 */

/**
 * The label that says "not yet": the check workflows skip while it is on
 * and `skip-ci-label.yml` holds the merge with a `pending` `no-skip-ci-label`
 * status. It is a label, deliberately — a `skip-ci` in the title means
 * nothing to any workflow.
 */
export const SKIP_CI_LABEL = 'skip-ci';

/**
 * The label that says a pull request has been reviewed and is waiting its
 * turn. It is the whole of `unblock-prs`'s scope rule: a pull request without
 * it is passed over in silence, and one with it is rebased, released from
 * `skip-ci` and watched when its turn comes.
 */
export const MERGE_QUEUED_LABEL = 'merge-queued';

/**
 * The label a pull request carries to say the next release must contain it:
 * while it is open, the version pull request is not picked.
 *
 * It exists because the version pull request is the one pull request whose
 * body cannot declare a `Merge-After:` — `changesets/action` overwrites the
 * title and body of it on every push to the base — so the ordering is
 * declared from the other side, by the pull request the release is waiting
 * for. A label rather than a trailer for the same reason `merge-queued` is
 * one: this repository is public, and a label needs write access while a
 * comment does not.
 *
 * Nothing ever takes it off. The constraint is "open", so it ends when the
 * pull request merges or is closed, and there is no state left behind to
 * clean up.
 */
export const BLOCKS_RELEASE_LABEL = 'blocks-release';

/**
 * The label that asks `unblock-prs` to keep a pull request on the tip of the
 * default branch while it waits, so that its diff stays readable for review.
 * It is honoured only together with `skip-ci`, under which the push runs no
 * checks, and only when the queue has nothing to do. `open-pr` puts it on
 * every layer of a stack: one above the bottom is carried along by the layer
 * below, and needs the label of its own once that layer merges and it is
 * moved onto the default branch.
 */
export const AUTO_REBASE_LABEL = 'auto-rebase';

/**
 * The labels that move a pull request within `unblock-prs`'s pick order:
 * among the ones it may pick, those labelled `priority:high` go first and
 * those labelled `priority:low` last, the version pull request included.
 * They decide nothing else — what `Merge-After:`, a stack or
 * `blocks-release` holds back stays held, and a pull request already in
 * flight is watched whatever it carries. One carrying both counts as
 * neither. `priority:mid`, which also exists on GitHub, is not read: it is
 * the same as carrying neither.
 */
export const PRIORITY_HIGH_LABEL = 'priority:high';

export const PRIORITY_LOW_LABEL = 'priority:low';
