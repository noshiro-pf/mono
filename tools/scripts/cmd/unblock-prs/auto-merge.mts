/**
 * When this script arms auto-merge.
 *
 * Nobody else does. `open-pr` opens a pull request with none, and the author
 * queueing it with `merge-queued` is the request to land it; this script
 * arms it when it picks it — before taking `skip-ci` off one it rebases, and
 * before watching one that is already up to date. Arming at pick time rather
 * than at opening is what keeps a stacked pull request unarmed while it is
 * stacked: its base is another pull request's branch, which no ruleset
 * covers, so armed there it would merge into that branch the moment nothing
 * held it. It is picked only once GitHub has moved it onto the default
 * branch, where the ruleset gates the merge.
 *
 * A person who switches auto-merge off after queueing a pull request has
 * said "not this one, not yet", and it is not armed again until they queue it
 * again — `merge-queued` off and on. That is read from the timeline. GitHub
 * disarming it on its own, as it does when the base changes, is not a person
 * saying anything.
 */

import { type TimelineEvent } from './types.mjs';

/**
 * Whether a queued pull request without auto-merge may be armed: unless a
 * person disarmed it after it was last queued. A timeline that no longer
 * reaches back to the label — only the latest events are read — counts only
 * the disarms it does reach.
 */
export const armsOnPick = (events: readonly TimelineEvent[]): boolean => {
  const queuedAt = events.findLastIndex((event) => event.kind === 'queued');

  return events
    .slice(queuedAt + 1)
    .every(
      (event) => !(event.kind === 'auto-merge-disabled' && event.manually),
    );
};
