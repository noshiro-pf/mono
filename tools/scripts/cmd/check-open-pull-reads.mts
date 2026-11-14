import { Arr, Result } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import * as ts from 'typescript';
import { listTrackedFiles, readRepositoryFile } from '../lib/repo-files.mjs';
import { skipExpressionWrappers } from '../lib/ts-expression-wrappers.mjs';

/**
 * Fails when source reads the open pull requests one page at a time and stops.
 *
 * GitHub answers a list of a hundred at most. A reader that takes the first
 * page for the whole goes wrong silently once more are open: `unblock-prs`'s
 * survey, which read the newest hundred, left the oldest queued pull requests
 * unpicked, and the queue read each one left out as merged, so what named it in
 * `Merge-After` could go first and its `blocks-release` no longer held the
 * release. Nothing failed, because one page is a valid answer.
 *
 * Three shapes are reported, in the tracked TypeScript under a package's `src/`
 * and under `tools/` (tests and their fixtures aside, and `experimental/`,
 * which is not built):
 *
 * - a string or template that asks GraphQL for `pullRequests(states: OPEN …`
 *   without `after:` on the same line — the cursor the next page needs;
 * - a URL with `/pulls?state=open` and `per_page` but no `page=` and no
 *   `head=` (a base path a reader appends its paging to has no `per_page`
 *   yet);
 * - a `rest(…, 'GET', '/pulls', …)` call whose `query` has `state: 'open'` and
 *   no `head`, which narrows the list to one branch and is a lookup rather
 *   than a list. `restAllPages` reads every page and is what to call instead.
 *
 * It reads literals, not what runs: a query assembled so that the connection
 * and its cursor fall on different lines is reported, and one whose cursor is
 * present but never followed is not. `as`, `satisfies`, `!`, `<T>` and
 * parentheses are seen through.
 */
export const checkOpenPullReads = (): Promise<Result<number, string>> =>
  Result.safeTry(async function* () {
    const tracked = yield* Result.safeUnwrap(await listTrackedFiles());

    const files = tracked.filter(isScannedSource);

    const mut_violations: string[] = [];

    for (const file of files) {
      const text = yield* Result.safeUnwrap(await readRepositoryFile(file));

      // Most files name no pull request at all; parse only those that might.
      if (!text.includes('pulls') && !text.includes('pullRequests')) {
        continue;
      }

      mut_violations.push(...findUnpagedOpenPullReads(file, text));
    }

    return Arr.isNonEmpty(mut_violations)
      ? Result.err(
          [
            '❌ These read one page of the open pull requests, which is a part of them once more than a hundred are open:',
            ...mut_violations.map((violation) => `  ${violation}`),
            'Follow every page: `restAllPages` / `collectPages` for REST, `after: $after` and `pageInfo { hasNextPage endCursor }` for GraphQL.',
          ].join('\n'),
        )
      : Result.ok(files.length);
  });

/** Whether this guard reads a tracked path. */
export const isScannedSource = (file: string): boolean =>
  (file.startsWith('tools/') ||
    (PACKAGE_ROOTS.has(file.split('/', 1)[0] ?? '') &&
      file.split('/').includes('src'))) &&
  /\.(?:mts|cts|ts|tsx)$/u.test(file) &&
  !/\.test\.(?:mts|cts|ts|tsx)$/u.test(file) &&
  !file.endsWith('.d.mts') &&
  !file.endsWith('.d.ts');

/**
 * Each one-page read of the open pull requests in `text`, as
 * `<file>:<line>: <what>`.
 */
export const findUnpagedOpenPullReads = (
  file: string,
  text: string,
): readonly string[] => {
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const mut_found: string[] = [];

  const report = (node: ts.Node, what: string): void => {
    const { line } = source.getLineAndCharacterOfPosition(
      node.getStart(source),
    );

    mut_found.push(`${file}:${(line + 1).toString()}: ${what}`);
  };

  const visit = (node: ts.Node): void => {
    const literal = literalTextOf(node);

    if (literal !== undefined) {
      for (const line of literal.split('\n')) {
        if (GRAPHQL_OPEN.test(line) && !line.includes('after:')) {
          report(
            node,
            'pullRequests(states: OPEN, …) without `after:` reads one page of the open pull requests',
          );
        }
      }

      if (
        literal.includes('/pulls?') &&
        /[?&]state=open\b/u.test(literal) &&
        /[?&]per_page=/u.test(literal) &&
        !/[?&]page=/u.test(literal) &&
        !/[?&]head=/u.test(literal)
      ) {
        report(
          node,
          '/pulls?state=open without `page=` reads one page of the open pull requests',
        );
      }
    }

    if (ts.isCallExpression(node) && isOnePageRestOfOpenPulls(node)) {
      report(
        node,
        "rest(…, '/pulls', …) of the open pull requests reads one page; use restAllPages",
      );
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  return mut_found;
};

const GRAPHQL_OPEN = /pullRequests\(\s*states:\s*\[?\s*OPEN\b/u;

const PACKAGE_ROOTS: ReadonlySet<string> = new Set<string>([
  'apps',
  'libs',
  'languages',
]);

/**
 * The text of a string or template literal, a substitution standing as `${}`;
 * `undefined` for any other node.
 */
const literalTextOf = (node: ts.Node): string | undefined =>
  ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : ts.isTemplateExpression(node)
      ? Arr.toUnshifted(node.head.text)(
          node.templateSpans.map(({ literal }) => `\${}${literal.text}`),
        ).join('')
      : undefined;

/** The initializer of `object`'s property `key`, if it is an object literal. */
const propertyOf = (
  object: ts.Node,
  key: string,
): ts.Expression | undefined => {
  if (!ts.isObjectLiteralExpression(object)) {
    return undefined;
  }

  for (const property of object.properties) {
    if (
      ts.isPropertyAssignment(property) &&
      (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) &&
      property.name.text === key
    ) {
      return property.initializer;
    }

    if (
      ts.isShorthandPropertyAssignment(property) &&
      property.name.text === key
    ) {
      return property.name;
    }
  }

  return undefined;
};

/** The value of a string literal, seen through its wrappers. */
const stringOf = (node: ts.Node | undefined): string | undefined => {
  if (node === undefined) {
    return undefined;
  }

  const inner = skipExpressionWrappers(node);

  return ts.isStringLiteral(inner) || ts.isNoSubstitutionTemplateLiteral(inner)
    ? inner.text
    : undefined;
};

/**
 * `rest(…, 'GET', '/pulls', …, { query: { state: 'open', … } })` with no `head`
 * in the query.
 */
const isOnePageRestOfOpenPulls = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.CallExpression has no readonly form the compiler API accepts; read only.
  call: ts.CallExpression,
): boolean => {
  const callee = skipExpressionWrappers(call.expression);

  const name = ts.isIdentifier(callee)
    ? callee.text
    : ts.isPropertyAccessExpression(callee)
      ? callee.name.text
      : undefined;

  if (name !== 'rest') {
    return false;
  }

  const [, method, route, , options] = call.arguments;

  if (
    options === undefined ||
    stringOf(method) !== 'GET' ||
    stringOf(route) !== '/pulls'
  ) {
    return false;
  }

  const query = propertyOf(skipExpressionWrappers(options), 'query');

  if (query === undefined) {
    return false;
  }

  const queryObject = skipExpressionWrappers(query);

  return (
    ts.isObjectLiteralExpression(queryObject) &&
    stringOf(propertyOf(queryObject, 'state')) === 'open' &&
    propertyOf(queryObject, 'head') === undefined
  );
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkOpenPullReads();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `✅ No one-page read of the open pull requests in ${result.value.toString()} files.`,
  );
}
