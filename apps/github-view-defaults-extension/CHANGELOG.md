# github-view-defaults-extension

## 0.4.14

### Patch Changes

- Updated dependencies [e9340d0]
- Updated dependencies [a6d03ea]
- Updated dependencies [e7b459f]
- Updated dependencies [d5640ce]
    - ts-data-forge@15.0.0

## 0.4.13

### Patch Changes

- Updated dependencies [931ba22]
    - ts-data-forge@14.13.0

## 0.4.12

### Patch Changes

- Updated dependencies [7b52a2d]
    - ts-data-forge@14.12.1

## 0.4.11

### Patch Changes

- Updated dependencies [39ac703]
    - ts-data-forge@14.12.0

## 0.4.10

### Patch Changes

- Updated dependencies [36ffebb]
- Updated dependencies [23bfcbe]
    - ts-data-forge@14.11.1

## 0.4.9

### Patch Changes

- Updated dependencies [e9420e9]
- Updated dependencies [a48864f]
- Updated dependencies [1f78470]
- Updated dependencies [d567a6a]
    - ts-data-forge@14.11.0

## 0.4.8

### Patch Changes

- Updated dependencies [eb65772]
- Updated dependencies [5618786]
- Updated dependencies [c53c17d]
- Updated dependencies [86c41cb]
- Updated dependencies [b7a2d57]
- Updated dependencies [a5235cf]
    - ts-data-forge@14.10.2

## 0.4.7

### Patch Changes

- Updated dependencies [ad2df6c]
    - ts-data-forge@14.10.1

## 0.4.6

### Patch Changes

- Updated dependencies [7f3e173]
    - ts-data-forge@14.10.0

## 0.4.5

### Patch Changes

- Updated dependencies [079cb28]
    - ts-data-forge@14.9.0

## 0.4.4

### Patch Changes

- af35184: Stop keeping `w=1` and `show-viewed-files=false` on a pull request diff's address after the page has loaded, and leave GitHub's "Refresh" button to GitHub. The wrapping of `history.pushState` and `history.replaceState`, the write-back behind it, and the taking of the Refresh click are removed; they did not keep the parameters reliably. GitHub now refreshes the diff in place, and a diff loaded again from an address without the parameters, by a reload or a bookmark, is redirected to one with them, as before.
- Updated dependencies [f89dc57]
    - ts-data-forge@14.8.0

## 0.4.3

### Patch Changes

- 29b4d8c: A pull request diff keeps `w=1` and `show-viewed-files=false` on its address after a reload. GitHub can write the diff's bare path more than once after loading it, and the extension answered each address only once, so the second write left the address without them. GitHub's own `pushState` and `replaceState` calls on the same page now keep the parameters the address carried, so the address never loses them.

## 0.4.2

### Patch Changes

- 638352b: Keep `w=1&show-viewed-files=false` when the "Refresh" button on a pull request diff is clicked after the pull request has been pushed to. GitHub reloaded the diff in place at its bare path, without them; the extension now has the click before any of GitHub's handlers, so the refresh loads the diff with the defaults on.

## 0.4.1

### Patch Changes

- 7bbee21: Keep `w=1&show-viewed-files=false` on a pull request diff's address after GitHub takes them off, for example when it jumps to the first file not yet marked viewed and leaves `/changes#diff-…`. The extension writes them back in place, without loading the page again, and now also runs inside frames, so a diff in a split-view pane keeps them too.

## 0.4.0

### Minor Changes

- 2224d0b: Put the number of a pull request or an issue at the front of its tab title,
  as `#1234`, where a narrow tab still shows it.

### Patch Changes

- ts-data-forge@14.7.1
