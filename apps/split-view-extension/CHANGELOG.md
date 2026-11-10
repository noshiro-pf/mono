# split-view-extension

## 0.9.5

### Patch Changes

- Updated dependencies [3f822d1]
- Updated dependencies [4d7929b]
    - synstate-dom@0.10.0
    - synstate@8.0.0
    - split-view-link@0.0.2
    - ts-data-forge@14.13.0

## 0.9.4

### Patch Changes

- Updated dependencies [931ba22]
- Updated dependencies [fef212d]
- Updated dependencies [72bb513]
- Updated dependencies [60fe319]
- Updated dependencies [c9df77c]
- Updated dependencies [5f66da0]
    - ts-data-forge@14.13.0
    - synstate-dom@0.9.0
    - synstate@8.0.0
    - split-view-link@0.0.2

## 0.9.3

### Patch Changes

- Updated dependencies [54a6cc3]
    - synstate@7.0.2
    - synstate-dom@0.8.0

## 0.9.2

### Patch Changes

- Updated dependencies [7b52a2d]
    - ts-data-forge@14.12.1
    - split-view-link@0.0.1
    - synstate@7.0.1
    - synstate-dom@0.8.0

## 0.9.1

### Patch Changes

- Updated dependencies [39ac703]
    - ts-data-forge@14.12.0
    - synstate@7.0.1
    - synstate-dom@0.8.0

## 0.9.0

### Minor Changes

- 04269a1: Adds "Open in a split to the right" and "Open in a split below" to the context menu of web pages and links, titled in Japanese when Chrome's UI is: in a split view they split the pane the menu was opened in, as its split buttons do, and open the link in the new pane; anywhere else they open the page beside the link, or beside an empty pane, in a new split view that replaces the tab.

### Patch Changes

- 92bc12e: The split view page is drawn by synstate-dom rather than React. It looks and behaves as before; its script is about a quarter of the size (`split.js` 268 kB → 65 kB, 83 kB → 22 kB gzipped).
- Updated dependencies [36ffebb]
- Updated dependencies [23bfcbe]
- Updated dependencies [c8ab3c9]
    - ts-data-forge@14.11.1
    - synstate-dom@0.8.0
    - synstate@7.0.1

## 0.8.0

### Minor Changes

- f4d582d: A split can hold one pane at a fixed width or height in pixels, the other pane taking the rest (`r737fpp` in a `layout=` spec), and dragging its divider keeps it in pixels. A pull request now opens with the diff held at 737px, in both layouts; beside the diff alone the conversation takes the rest of the page, and in three columns it is held at 577px, the widest its description gets with the reviewers and labels below it, the issue or the session taking the rest.

### Patch Changes

- c5370ee: A pull request opened in a split view shows its diff at 67%, in both the two- and the three-column layout, so that GitHub's file tree stays beside it.
- 369f616: `Ctrl+R` / `F5` with the focus in a frame nested inside a pane's page (an embedded editor, a comment widget, `about:blank` and `srcdoc` frames included) reloads that pane rather than the whole tab, and `Alt+1..9` switches split views from there too: the nested frame hands the key up to the pane's own frame. A workspace shortcut the page has already handled is left to it, as the reload shortcut was.
- react-utils@0.0.26
    - ts-data-forge@14.11.0

## 0.7.5

### Patch Changes

- Updated dependencies [e9420e9]
- Updated dependencies [a48864f]
- Updated dependencies [1f78470]
- Updated dependencies [d567a6a]
    - ts-data-forge@14.11.0
    - react-utils@0.0.25

## 0.7.4

### Patch Changes

- e44fb03: Open a pull request's conversation at 75% beside the diff alone, as it is
  beside the issue or the session, and put the issue and the Claude Code session
  to the right of the conversation, the issue stacked over the session when both
  are there. The diff is at 75% in three columns.
- Updated dependencies [eb65772]
- Updated dependencies [5618786]
- Updated dependencies [c53c17d]
- Updated dependencies [86c41cb]
- Updated dependencies [b7a2d57]
- Updated dependencies [a5235cf]
    - ts-data-forge@14.10.2
    - react-utils@0.0.24

## 0.7.3

### Patch Changes

- Updated dependencies [ad2df6c]
    - ts-data-forge@14.10.1
    - react-utils@0.0.23

## 0.7.2

### Patch Changes

- react-utils@0.0.22
    - ts-data-forge@14.10.0

## 0.7.1

### Patch Changes

- react-utils@0.0.21

## 0.7.0

### Minor Changes

- c052de4: Open a pull request from the GitHub button or the context menu the way the PR Manager's links do, with the Claude Code session its description names on a `Claude-Session:` line: the session goes between the diff and the conversation, or, when the pull request also closes an issue, under the conversation, beside the issue.

### Patch Changes

- 411fe63: Open a pull request that closes an issue with the diff and the conversation split off the issue first, so that closing the conversation widens the diff instead of the issue. The three columns keep their 2:1:1 widths.

## 0.6.4

### Patch Changes

- react-utils@0.0.20

## 0.6.3

### Patch Changes

- react-utils@0.0.19
    - ts-data-forge@14.10.0

## 0.6.2

### Patch Changes

- Updated dependencies [7f3e173]
    - ts-data-forge@14.10.0
    - react-utils@0.0.18

## 0.6.1

### Patch Changes

- Updated dependencies [079cb28]
    - ts-data-forge@14.9.0
    - react-utils@0.0.17

## 0.6.0

### Minor Changes

- af35184: `Ctrl+R` (`Cmd+R` on macOS) and `F5` pressed with the focus in a pane reload that pane rather than the whole tab. The content script takes the key and reloads its own page, as the pane's reload button does. A pane the content script cannot run in, such as a `chrome://` page, and a site that binds `Ctrl+R` itself still leave the key to the browser.

### Patch Changes

- Updated dependencies [f89dc57]
    - ts-data-forge@14.8.0
    - react-utils@0.0.16

## 0.5.4

### Patch Changes

- react-utils@0.0.15
    - ts-data-forge@14.7.1

## 0.5.3

### Patch Changes

- react-utils@0.0.14

## 0.5.2

### Patch Changes

- react-utils@0.0.13
    - ts-data-forge@14.7.1

## 0.5.1

### Patch Changes

- c028ee7: Draw a split view's tab favicon as the extension's icon in the split view's colour, its panes faded, with the number large across the middle. The round badge in the corner it showed before looked like a count of unread notifications.

## 0.5.0

### Minor Changes

- aba0fe9: Close the pull request's tab once **⧉ Split view** has opened it in a split view, so the split view takes its place instead of leaving a second tab behind. `Ctrl`+click or a middle click still opens the split view behind the current tab and keeps that tab, and the context menu never closes a tab.

### Patch Changes

- 7079150: Fix the **⧉ Split view** button on GitHub doing nothing in a development build when the browser lacks one of the debugging APIs the diagnostics listen to. The service worker stopped halfway through starting up, so the button's click failed with "Could not establish connection" and then "F is not a function". The diagnostics are now skipped in such a browser, with an error in the worker's console, and the rest of the worker starts as usual.
- d0d70d5: Draw a split view's tab favicon as the extension's icon with the split view's number on a badge in its corner, as an extension's toolbar icon carries one. The coloured square with a number it showed before looked like Google Calendar's tab icon, and the two were hard to tell apart in the tab strip.
- react-utils@0.0.12

## 0.4.2

### Patch Changes

- react-utils@0.0.11
    - ts-data-forge@14.7.1

## 0.4.1

### Patch Changes

- react-utils@0.0.10
    - ts-data-forge@14.7.1

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
