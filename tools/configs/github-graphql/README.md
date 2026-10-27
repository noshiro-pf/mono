# GitHub's GraphQL schema

`schema.docs.graphql` is GitHub's public GraphQL schema, copied verbatim from
[`github/docs`](https://github.com/github/docs/blob/main/src/graphql/data/fpt/schema.docs.graphql),
where GitHub publishes it for its API reference. It is © GitHub, Inc. and
licensed under [CC BY 4.0](https://github.com/github/docs/blob/main/LICENSE).

The tests that check the GraphQL requests against it read it from here:

- `libs/pr-merge-queue/src/github-graphql.test.mts`
- `apps/pr-manager-app/src/github-graphql.test.mts`

GitHub answers a query it cannot read with an error and no data, and a query
is a string, so nothing else says one is wrong before it reaches GitHub.

## Refreshing it

```sh
pnpm run update-github-graphql-schema
```

Then run both tests. A field GitHub added since the last copy fails them
until the copy is refreshed. A field GitHub removed fails them after it.

Prettier and cspell leave the file alone, so the diff after a refresh is
GitHub's change and nothing else.

## Why not `@octokit/graphql-schema`

Its latest release (15.26.1) lacks fields the queries use, such as
`Issue.blockedBy`. `github/docs` is where GitHub
itself publishes the schema, and it is current.
