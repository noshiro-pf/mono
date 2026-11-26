# Next major

- Remove the deprecated id `total-functions/no-hidden-type-assertions`.

    The rule moved to `eslint-plugin-ts-restrictions` as
    `ts-restrictions/no-hidden-type-assertions`, since it grew far past the rule
    of the same name in `eslint-plugin-total-functions`, and this package's
    `total-functions` keeps the original rules alone. Both ids are off in the
    presets. The old id stays registered (`movedRule` in
    `src/plugins/total-functions/rules/rules.mts`), deprecated, so that a config
    or an `eslint-disable` comment naming it still loads. Removing it breaks
    such a config: it has to name the new id.

- Remove the deprecated ids `ts-restrictions/jsx-boolean-logical-operands` and
  `ts-restrictions/require-ime-guard-on-enter`.

    Both rules moved to `eslint-plugin-ts-ui-restrictions`, as
    `ts-ui-restrictions/jsx-boolean-logical-operands` and
    `ts-ui-restrictions/require-ime-guard`, which the presets turn on in their
    place. The old ids stay registered (`movedRule` in
    `src/plugins/ts-restrictions/rules/rules.mts`), deprecated and off, so that
    a config or an `eslint-disable` comment naming one still loads. Removing
    them breaks such a config: it has to name the new id.
