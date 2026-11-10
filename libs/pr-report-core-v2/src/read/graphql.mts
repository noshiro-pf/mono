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

/** One query, with every value from GitHub passed as a variable. */
export const graphqlRead = async <A,>(
  context: ReadContext,
  what: string,
  query: string,
  variables: ReadonlyRecord<string, number | string | null>,
  schema: t.Type<A>,
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
    body: JSON.stringify({
      query,
      variables: { owner: context.owner, name: context.name, ...variables },
    }),
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
    (envelope.value.errors ?? []).map(({ type, message }) => ({
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

const GRAPHQL_URL = 'https://api.github.com/graphql';

const EnvelopeSchema = t.record({
  data: t.optional(t.unknown()),
  errors: t.optional(
    t.array(t.record({ type: t.optional(t.string()), message: t.string() })),
  ),
});
