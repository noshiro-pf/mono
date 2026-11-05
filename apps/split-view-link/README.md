# split-view-link

What a page outside `split-view-extension` needs to open a split view, shared by
the extension and the pages that link to it, so that the two cannot drift apart:

- `split-view-page.mts` — the extension's id, the path of `split.html`, and the
  names of its query parameters.
- `pull-request.mts` — the query string that opens a pull request: the diff,
  the conversation, and the issue it closes or the Claude Code session it names,
  with the layout and the zoom each is shown at. Used by the extension's own
  button on GitHub and by the PR Manager's links.
- `claude-session.mts` — the `Claude-Session:` trailers of a pull request's
  description.

Private, and not built: siblings import `src/` directly.
