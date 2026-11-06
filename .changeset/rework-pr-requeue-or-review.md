---
'pr-merge-queue': minor
---

`rework-pr done` takes one of `--requeue` or `--review`, and refuses neither. `--requeue`, for work that changes nothing the description says, puts `merge-queued` back on last, but only where `rework-pr start` took it off and nobody has put it on or taken it off since: `start` now writes down GitHub's event of taking the label off under the clone's common git directory, and `done` requeues only while that event is still the label's last. `--review`, for work that does, leaves it off for the author as `done` did before. `applyRework` takes the parsed `ReworkArgs` and resolves to the pull request's number and the steps that ran; `doneSteps` takes what `done` hands back and the `QueueRecord` `start` left; `ReworkIo` gains `queueRecord`; `isUntouchedSince`, `readOwnDequeueEvent`, `QueueEvent` and `QueueRecord` are new, and `takeLabelOff` is `removeLabel` saying whether this call took the label off or it was off already.
