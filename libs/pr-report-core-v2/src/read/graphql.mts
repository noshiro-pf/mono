/**
 * GraphQL reads: one query, its `data` decoded, each failure a
 * {@link ReadError} — the HTTP status first, then GraphQL's own `errors`, which
 * come with a 200. Partial `data` beside an error is dropped: a part is read
 * whole or not at all.
 */

import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Read } from '../snapshot/index.mjs';
import {
  classifyGraphqlErrors,
  classifyHttp,
  malformed,
  unanswered,
} from './classify.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * One query, with every value from GitHub passed as a variable, and the
 * repository's `$owner` and `$name` too.
 */
export const graphqlRead = async <A,>(
  context: ReadContext,
  what: string,
  query: string,
  variables: ReadonlyRecord<string, number | string | null>,
  schema: t.Type<A>,
): Promise<Read<A>> =>
  graphqlSend(
    context,
    what,
    query,
    { owner: context.owner, name: context.name, ...variables },
    schema,
  );

/**
 * {@link graphqlRead} for a query of aliased lookups under `repository`, each of
 * which may name nothing: GitHub answers such an alias `null`, with a
 * `NOT_FOUND` error whose path is `repository` and the alias. Those errors are
 * the answer, not a failure; any other error fails the read as before.
 */
export const graphqlReadAllowingMissing = async <A,>(
  context: ReadContext,
  what: string,
  query: string,
  variables: ReadonlyRecord<string, number | string | null>,
  schema: t.Type<A>,
): Promise<Read<A>> =>
  graphqlSend(
    context,
    what,
    query,
    { owner: context.owner, name: context.name, ...variables },
    schema,
    isMissingAlias,
  );

/**
 * One mutation, `variables` alone passed: a variable sent that the operation
 * does not declare is an error to GraphQL. The one way a command writes over
 * GraphQL, so that what a read refuses a write refuses too.
 */
export const graphqlWrite = async (
  context: ReadContext,
  what: string,
  mutation: string,
  variables: ReadonlyRecord<string, number | string | null>,
): Promise<Read<undefined>> =>
  Result.map(
    await graphqlSend(context, what, mutation, variables, t.unknown()),
    () => undefined,
  );

const GRAPHQL_URL = 'https://api.github.com/graphql';

const EnvelopeSchema = t.record({
  data: t.optional(t.unknown()),
  errors: t.optional(
    t.array(
      t.record({
        type: t.optional(t.string()),
        message: t.string(),
        path: t.optional(t.array(t.union([t.string(), t.number()]))),
      }),
    ),
  ),
});

type GraphqlError = NonNullable<
  t.TypeOf<typeof EnvelopeSchema>['errors']
>[number];

/** A lookup under `repository` that named nothing (`repository.n3`). */
const isMissingAlias = ({ type, path }: GraphqlError): boolean =>
  type === 'NOT_FOUND' && path?.length === 2 && path[0] === 'repository';

const noneAllowed = (): boolean => false;

const graphqlSend = async <A,>(
  context: ReadContext,
  what: string,
  query: string,
  variables: ReadonlyRecord<string, number | string | null>,
  schema: t.Type<A>,
  isAnswer: (failure: GraphqlError) => boolean = noneAllowed,
): Promise<Read<A>> => {
  const answer = await context.transport({
    method: 'POST',
    url: GRAPHQL_URL,
    headers: {
      accept: 'application/vnd.github+json',
      'content-type': 'application/json',
      ...(context.token === undefined
        ? {}
        : { authorization: `Bearer ${context.token}` }),
    },
    body: JSON.stringify({ query, variables }),
  });

  if (answer.kind === 'failed') {
    return Result.err(unanswered(what, answer.message));
  }

  const error = classifyHttp(what, answer);

  if (error !== undefined) {
    return Result.err(error);
  }

  const parsed = Json.parse(answer.body);

  if (Result.isErr(parsed)) {
    return Result.err(malformed(what, parsed.value));
  }

  const envelope = EnvelopeSchema.validate(parsed.value);

  if (Result.isErr(envelope)) {
    return Result.err(
      malformed(what, t.validationErrorsToMessages(envelope.value).join('; ')),
    );
  }

  const graphqlError = classifyGraphqlErrors(
    what,
    (envelope.value.errors ?? [])
      .filter((each) => !isAnswer(each))
      .map(({ type, message }) => ({
        type,
        message,
      })),
  );

  if (graphqlError !== undefined) {
    return Result.err(graphqlError);
  }

  const decoded = schema.validate(envelope.value.data);

  return Result.isErr(decoded)
    ? Result.err(
        malformed(what, t.validationErrorsToMessages(decoded.value).join('; ')),
      )
    : Result.ok(decoded.value);
};
