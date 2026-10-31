# `check:root:actionlint`

Lints the GitHub Actions configuration with the actionlint and shellcheck that
`tools/configs/release-binaries.json` pins:

- `main.mts` runs actionlint over `.github/workflows/`, which runs shellcheck
  over each workflow's `run:` blocks. The `runs.steps` of each composite
  action under `.github/actions/`, which actionlint reads only for its
  inputs, are then copied line for line into a one-job workflow declaring
  the action's inputs and given to the same actionlint over stdin, so every
  key of a step (`run:`, `env:`, `with:`, `if:`) is judged as a workflow's
  is; what it finds is moved back to its line and column in `action.yml`.
  The wrapper declares one secret, so a `secrets.<name>`, which a composite
  action cannot read, is reported too. Not reported: the secrets every
  workflow has (`secrets.GITHUB_TOKEN`, the two `ACTIONS_*_DEBUG`),
  `toJSON(secrets)`, a key only a workflow's step takes (`timeout-minutes:`),
  and the `with:` of a local action (`uses: ./…`), which actionlint resolves
  only from a file.
- `run-scripts.mts` finds those steps and their `run:` scripts in each
  `action.yml`.
  It reports any shape it does not read rather than skipping it.

The binaries come from `../../lib/release-binaries.mts`. It downloads each
pinned asset into `node_modules/.cache/release-binaries/`, checks it against
the pinned SHA-256 every time it is used, and extracts the binary from it, so
nothing has to be installed and `PATH` is never consulted. CI keeps the
archives between runs with `actions/cache` (`code-check.yml`, `check:root`
entry). `pnpm-update.yml` moves the pins (`mature-updates.mts
release-binaries`), and the header of `mature-updates.mts` says how far they
move on their own.

A finding that is wrong for its line is disabled on the command it names:
`# shellcheck disable=SC<number> # why`.
