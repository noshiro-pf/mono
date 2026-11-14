---
'pr-merge-queue': patch
---

Read every page of open pull requests in `pr-report`'s queue read, so that the commands built on it (`pr-report`, `report-unowned-prs`, `claim-pr`, `push-fixed-pr`, `rework-pr`, `run-unblock-prs-skill`, `run-issue-resolver` and `startable-issues`) no longer refuse to run once 100 or more pull requests are open. Without a token, a report that reads checks still has 60 requests an hour, roughly three per pull request.

`unblock-prs` now reads every open pull request in its survey, where it read the newest 100 and left the rest out silently: past 100 open, the oldest queued pull requests were never picked, and the queue read each one left out as merged, so a pull request naming it in `Merge-After` could merge first and its `blocks-release` no longer held the release. `start-issue` and `open-pr` read every page of the open pull requests when they look for the ones that close an issue, and `claim-pr`, `pr-report` and `open-pr` read every page of a pull request's comments and of an issue's `blocked_by` dependencies.
