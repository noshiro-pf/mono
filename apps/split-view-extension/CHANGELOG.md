# split-view-extension

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
