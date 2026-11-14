# eslint-plugin-ts-restrictions

## 1.1.0

### Minor Changes

- bc7bd89: `ts-restrictions/require-ime-guard-on-enter` checks Escape too, under the new message id `missingImeGuardOnEscape`: the Escape that cancels an input method's conversion closes a dialog or drops an edit just as the confirming Enter submits. The new `keys` option (default `["Enter", "Escape"]`) turns either off. The rule now also follows a key read into a `const` (`const key = event.key; key === 'Enter'`) and sees `includes` / `has` on a literal array or `Set`, or a `const` bound to one, that holds the key (`['Enter', ' '].includes(event.key)`). A guard function imported by name or through a namespace is matched by the name its module exports, so `import { isImeKeyDown as imeKey }` counts and another export imported as `isImeKeyDown` does not; an import of `default`, a local declaration and a method (`keys['isImeKeyDown'](event)` included) are matched by the name they are called by. A `guardFunctions` entry that named a renamed import by its local name (`imeKey` above) no longer matches it; name the export instead. A `const` bound to the event or to a member chain on it (`const native = event.nativeEvent`) is read as what it names, on the key's side and the guard's. A `new Set` counts only when `Set` is the standard one, not a value the file declares or imports. An optional chain in a guard's argument (`isImeKeyDown(event?.nativeEvent)`), inside a type wrapper or not, is read through.

### Patch Changes

- Updated dependencies [82d252e]
- Updated dependencies [eb39008]
    - eslint-rule-forge@0.11.0
    - ts-type-forge@9.2.7

## 1.0.1

### Patch Changes

- Updated dependencies [1e5abc2]
- Updated dependencies [2f758a4]
- Updated dependencies [ae57625]
- Updated dependencies [47af2c3]
- Updated dependencies [e9340d0]
- Updated dependencies [a6d03ea]
- Updated dependencies [e7b459f]
- Updated dependencies [d3a20c8]
- Updated dependencies [d5640ce]
- Updated dependencies [40645fa]
- Updated dependencies [b1aa42c]
    - eslint-rule-forge@0.10.0
    - ts-type-forge@9.2.6
    - ts-data-forge@15.0.0
