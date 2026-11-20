import { buildSchema, parse, validate, type GraphQLSchema } from 'graphql';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { unknownToString } from 'ts-data-forge';

/**
 * What GitHub would say is wrong with `query`, empty when nothing is: its
 * syntax, and each field, argument, type and variable it names, checked against
 * the schema GitHub publishes (`github-graphql/`, whose `README.md` says from
 * where and how to refresh it).
 *
 * GitHub answers a query it cannot read with an error and no data, and a query
 * is a string, so nothing short of a request to GitHub says one is wrong. Each
 * package whose `src/` writes GraphQL checks every query it sends with this in
 * its `src/github-graphql.test.mts`, beside `queriesNotSent`
 * (`github-graphql-source-queries.mts`), which names a query in its source
 * none of the checked ones contains;
 * `check:root:github-graphql-tests` holds every such package to that file.
 */
export const githubGraphqlErrors = (query: string): readonly string[] => {
  try {
    return validate(githubSchema(), parse(query)).map(({ message }) => message);
  } catch (error: unknown) {
    return [unknownToString(error)];
  }
};

/**
 * GitHub's schema as GitHub publishes it, built once. Built without its own
 * validation: GitHub's SDL does not pass every rule `graphql` checks a schema
 * against (an interface field that is not deprecated where an implementation's
 * is), and what is checked here is the queries.
 */
const githubSchema = (() => {
  let mut_schema: GraphQLSchema | undefined = undefined;

  return (): GraphQLSchema => {
    mut_schema ??= buildSchema(
      fs.readFileSync(
        path.resolve(import.meta.dirname, 'github-graphql/schema.docs.graphql'),
        'utf8',
      ),
      { assumeValid: true, assumeValidSDL: true },
    );

    return mut_schema;
  };
})();
