# split-view-extension

## 0.4.0

### Minor Changes

- 54a580a: Open any pull request on GitHub in a split view, as the PR Manager's links do: a **⧉ Split view** button at the bottom left of every pull request page, and an **Open pull request in Split View** item in the context menu of a link to one. The diff is put beside the conversation, and the issue the pull request closes, when there is one, beside that. Adds the `contextMenus` permission, and a content script on github.com that reads a pull request's title and closing issue from its conversation page.
- 1409d7f: With no split view open — as after the extension is updated, which closes their tabs — the toolbar button opens every saved split view in a tab of its own, the one looked at last in front, instead of only that one. While any split view is open it goes back to the one looked at last, as before. A split view that loads in a background tab no longer takes over as the one the button goes back to until it is shown.

### Patch Changes

- e27531c: Fix split views opened at the same time — with **↗ Open all** or the toolbar button — being forgotten as open for up to 30 seconds, during which opening them all again opened them a second time. Each tab now records itself under a key of its own, so tabs loading together no longer write over each other's records.
- react-utils@0.0.9
    - ts-data-forge@14.7.1

## 0.3.0

### Minor Changes

- 7a0f55b: Title a split view's tab after the page in its top-left pane, rather than
  after the split view's name, which now stands in only while that pane has no
  page. A `title=` in the URL names the tab instead, and is saved with the view.

### Patch Changes

- 7a0f55b: A split view put inside another page's frame now draws nothing. A build from
  source also lets pages on `noshiro-pf.github.io` open a split view from a
  link, which is how the PR Manager opens a pull request's diff beside its
  conversation; the store package leaves that out.

## 0.0.3

### Patch Changes

- react-utils@0.0.8

## 0.0.2

### Patch Changes

- Updated dependencies [6e23aed]
    - ts-data-forge@14.7.1
    - react-utils@0.0.7
