# github-view-defaults-extension

## 0.4.1

### Patch Changes

- 7bbee21: Keep `w=1&show-viewed-files=false` on a pull request diff's address after GitHub takes them off, for example when it jumps to the first file not yet marked viewed and leaves `/changes#diff-…`. The extension writes them back in place, without loading the page again, and now also runs inside frames, so a diff in a split-view pane keeps them too.

## 0.4.0

### Minor Changes

- 2224d0b: Put the number of a pull request or an issue at the front of its tab title,
  as `#1234`, where a narrow tab still shows it.

### Patch Changes

- ts-data-forge@14.7.1
