# Next major

- Remove the deprecated ids `ts-restrictions/jsx-boolean-logical-operands` and
  `ts-restrictions/require-ime-guard-on-enter`.

    Both rules moved to `eslint-plugin-ts-ui-restrictions`, as
    `ts-ui-restrictions/jsx-boolean-logical-operands` and
    `ts-ui-restrictions/require-ime-guard`, which the presets turn on in their
    place. The old ids stay registered (`movedRule` in
    `src/plugins/ts-restrictions/rules/rules.mts`), deprecated and off, so that
    a config or an `eslint-disable` comment naming one still loads. Removing
    them breaks such a config: it has to name the new id.
