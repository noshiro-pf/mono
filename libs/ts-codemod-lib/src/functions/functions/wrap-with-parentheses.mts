import * as tsm from 'ts-morph';

/**
 * Wraps a string with parentheses if not already wrapped.
 * Avoids adding redundant parentheses when the expression is already fully
 * wrapped with balanced parentheses.
 *
 * @example
 *
 * ```ts
 * assert.strictEqual(wrapWithParentheses('A'), '(A)');
 *
 * // already wrapped, so not '((A))'
 * assert.strictEqual(wrapWithParentheses('(A)'), '(A)');
 *
 * assert.strictEqual(wrapWithParentheses('A | B'), '(A | B)');
 *
 * assert.strictEqual(wrapWithParentheses('(A | B)'), '(A | B)');
 *
 * // the outer parentheses do not span everything, so a pair is added
 * assert.strictEqual(wrapWithParentheses('(A) | (B)'), '((A) | (B))');
 * ```
 */
export const wrapWithParentheses = (nodeStr: string): string => {
  const trimmed = nodeStr.trim();

  return isWrappedWithParentheses(trimmed)
    ? trimmed
    : (`(${trimmed})` as const);
};

/**
 * What {@link isWrappedWithParentheses} tracks while scanning. `parenDepth` is
 * the only verdict; `openBraces` tells the `}` that closes a template
 * substitution from one that closes a type literal.
 */
type ScanState = Readonly<{
  parenDepth: number;
  /**
   * One character per brace still open, innermost last: `{` for a type
   * literal's, `$` for a template substitution's (`${`).
   */
  openBraces: string;
}>;

type ScanStep = (state: ScanState, scanner: tsm.ts.Scanner) => ScanState;

const initialScanState: ScanState = {
  parenDepth: 0,
  openBraces: '',
} as const;

/**
 * Tokens after which the scan cannot be trusted. The scanner reads without a
 * parser, so it cannot tell a regular expression literal from a division: a
 * quote or parenthesis inside `/"/` or `/\(/` would be read as a string or a
 * parenthesis, and could balance by accident. No type contains one of these.
 */
const untrustedTokens: ReadonlySet<tsm.ts.SyntaxKind> =
  new Set<tsm.ts.SyntaxKind>([
    tsm.ts.SyntaxKind.SlashToken,
    tsm.ts.SyntaxKind.SlashEqualsToken,
    tsm.ts.SyntaxKind.Unknown,
  ]);

/**
 * How each token that matters moves the state; every other token leaves it as
 * is. A map rather than a `switch`, which would have to name every
 * `SyntaxKind`.
 */
const scanStep: ReadonlyMap<tsm.ts.SyntaxKind, ScanStep> = new Map<
  tsm.ts.SyntaxKind,
  ScanStep
>([
  [
    tsm.ts.SyntaxKind.OpenParenToken,
    (state) => ({ ...state, parenDepth: state.parenDepth + 1 }),
  ],
  [
    tsm.ts.SyntaxKind.CloseParenToken,
    (state) => ({ ...state, parenDepth: state.parenDepth - 1 }),
  ],
  [
    tsm.ts.SyntaxKind.OpenBraceToken,
    (state) => ({ ...state, openBraces: `${state.openBraces}{` }),
  ],
  [
    tsm.ts.SyntaxKind.TemplateHead,
    (state) => ({ ...state, openBraces: `${state.openBraces}$` }),
  ],
  [
    tsm.ts.SyntaxKind.CloseBraceToken,
    (state, scanner) =>
      // A `}` that closes a substitution resumes the template's text, which the
      // scanner reads only when asked to re-scan; the substitution stays open
      // when that text ends in another `${` (a `TemplateMiddle`).
      state.openBraces.endsWith('$') &&
      scanner.reScanTemplateToken(/* isTaggedTemplate */ false) !==
        tsm.ts.SyntaxKind.TemplateTail
        ? state
        : { ...state, openBraces: state.openBraces.slice(0, -1) },
  ],
]);

/**
 * Checks if a string is already wrapped with a single pair of balanced
 * parentheses that encompasses the entire expression.
 *
 * `'(A)'` and `'((A))'` are wrapped — in the second the outer pair still spans
 * everything — while `'A'` is not, and neither is `'(A) | (B)'`, whose first
 * parenthesis closes before the end.
 *
 * Only parenthesis tokens count: the text is read with TypeScript's scanner, so
 * a parenthesis inside a string literal, a template literal's text or a comment
 * (`(A | '(') | (B)`) does not. Text the scanner cannot read with certainty — a
 * `/` that may start a regular expression (so `(a / b)` too), an unterminated
 * string or template literal, unbalanced parentheses — is reported as not
 * wrapped, so that it gets a pair.
 *
 * Module-local, so `samples/` — which imports the package the way a consumer
 * does — cannot reach it, and it therefore carries no `@example`. See
 * {@link wrapWithParentheses}, the exported form, whose example covers the same
 * cases.
 */
const isWrappedWithParentheses = (str: string): boolean => {
  const trimmed = str.trim();

  if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
    return false;
  }

  const scanner = tsm.ts.createScanner(
    tsm.ts.ScriptTarget.Latest,
    /* skipTrivia */ true,
    tsm.ts.LanguageVariant.Standard,
    trimmed,
  );

  let mut_state: ScanState = initialScanState;

  for (
    let mut_token = scanner.scan();
    mut_token !== tsm.ts.SyntaxKind.EndOfFileToken;
    mut_token = scanner.scan()
  ) {
    // Wrapping is the safe answer: a redundant pair costs nothing, a missing
    // one changes the meaning.
    if (untrustedTokens.has(mut_token)) {
      return false;
    }

    mut_state = scanStep.get(mut_token)?.(mut_state, scanner) ?? mut_state;

    // Read after the step, which may have re-scanned a template's text.
    if (scanner.isUnterminated()) {
      return false;
    }

    // If we reach depth 0 before the end, the outer parentheses don't wrap
    // everything
    if (mut_state.parenDepth === 0 && scanner.getTokenEnd() < trimmed.length) {
      return false;
    }
  }

  // Unbalanced text is wrapped too.
  return mut_state.parenDepth === 0;
};
