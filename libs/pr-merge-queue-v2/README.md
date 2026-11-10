# `pr-merge-queue-v2`

The from-scratch rebuild of [`pr-merge-queue`](../pr-merge-queue/README.md),
private until it replaces it. What it is to do, and how a v1 fix reaches it, is
[`spec/README.md`](./spec/README.md); the commands it is to have, their options
and exit codes, are [`spec/commands.md`](./spec/commands.md).

So far it holds:

- `src/github/`: the token, the repository a command acts on, and the `fetch`
  transport the readers of [`pr-report-core-v2`](../pr-report-core-v2/README.md)
  send through.
- `src/cli/`: reading a command line.
- `src/commands/pr-report/`: `pr-report`, which reads one snapshot over REST,
  decides over it with `decideQueue` and prints the report. Its terminal and
  Markdown output and its JSON are v1's, save that v1 left each linked issue's
  title blank and its state `unknown`, which v2 reads, and that each issue
  carries its `start-issue` claim.

Run a command from the repository root. On Node 25.4 or later it turns on
`fetch`'s use of `HTTPS_PROXY` itself; an older one needs `NODE_USE_ENV_PROXY=1`
behind a proxy, which does no harm on a newer one:

```sh
NODE_USE_ENV_PROXY=1 NODE_OPTIONS='--disable-warning=UNDICI-EHPA' \
  pnpm exec tsx --tsconfig ./tools/configs/tsconfig.tsx.json \
  ./libs/pr-merge-queue-v2/src/cmd/pr-report.mts --format markdown
```

The root scripts keep running v1 until the swap
([`spec/README.md`](./spec/README.md), "Migration").

## Who changes this package

As `pr-report-core-v2`: a fix to `pr-merge-queue` is not ported here as code. A
fix that changes a rule is written into the specification, with the test that
shows it, and reaches this package when that command is built or rebuilt here.
